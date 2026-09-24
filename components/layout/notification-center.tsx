"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Loader2,
} from "lucide-react";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/app/actions/notifications";

type NotificationItem = Awaited<
  ReturnType<typeof getNotifications>
>[number];

function formatTime(date: Date) {
  const now = Date.now();
  const created = new Date(date).getTime();

  const diff = Math.max(0, now - created);

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getPriorityClass(priority: string) {
  switch (priority) {
    case "CRITICAL":
      return "bg-red-400";

    case "HIGH":
      return "bg-orange-400";

    case "NORMAL":
      return "bg-cyan-400";

    case "LOW":
      return "bg-slate-500";

    default:
      return "bg-cyan-400";
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "RETURN_REQUEST":
      return "↩";

    case "ASSET_ASSIGNED":
      return "✓";

    case "ASSET_RETURNED":
      return "↩";

    case "MAINTENANCE":
      return "⚙";

    case "LICENSE_EXPIRING":
      return "◷";

    case "LICENSE_EXPIRED":
      return "!";

    default:
      return "•";
  }
}

export function NotificationCenter() {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  async function loadNotifications() {
    try {
      setLoading(true);

      const data = await getNotifications();

      setNotifications(data);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  async function handleNotificationClick(
    notification: NotificationItem
  ) {
    try {
      setProcessingId(notification.id);

      if (!notification.isRead) {
        const result =
          await markNotificationAsRead(
            notification.id
          );

        if (result.success) {
          setNotifications((current) =>
            current.map((item) =>
              item.id === notification.id
                ? {
                    ...item,
                    isRead: true,
                    readAt: new Date(),
                  }
                : item
            )
          );
        }
      }

      setOpen(false);

      if (notification.href) {
        router.push(notification.href);
      }
    } catch (error) {
      console.error(
        "Failed to open notification:",
        error
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0) {
      return;
    }

    try {
      setMarkingAll(true);

      const result =
        await markAllNotificationsAsRead();

      if (result.success) {
        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            isRead: true,
            readAt: new Date(),
          }))
        );
      }
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* Notification Bell */}
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={17} />

        {unreadCount > 0 && (
          <>
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-400 px-1 text-[9px] font-bold text-slate-950">
              {unreadCount > 9
                ? "9+"
                : unreadCount}
            </span>

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[52px] z-[100] w-[390px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0f17] shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3.5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  Notifications
                </h3>

                {unreadCount > 0 && (
                  <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-[11px] text-slate-500">
                Your latest asset activity
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                ) : (
                  <CheckCheck size={13} />
                )}

                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[430px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2
                  size={20}
                  className="animate-spin text-cyan-400"
                />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.025]">
                  <Bell
                    size={18}
                    className="text-slate-600"
                  />
                </div>

                <p className="text-sm font-medium text-slate-300">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  You&apos;re all caught up.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isProcessing =
                  processingId === notification.id;

                return (
                  <button
                    key={notification.id}
                    type="button"
                    disabled={isProcessing}
                    onClick={() =>
                      void handleNotificationClick(
                        notification
                      )
                    }
                    className={`group flex w-full gap-3 border-b border-white/[0.05] px-4 py-3.5 text-left transition hover:bg-white/[0.035] ${
                      !notification.isRead
                        ? "bg-cyan-400/[0.025]"
                        : ""
                    }`}
                  >
                    <div className="relative mt-0.5 shrink-0">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-sm ${
                          !notification.isRead
                            ? "text-cyan-300"
                            : "text-slate-500"
                        }`}
                      >
                        {isProcessing ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          getNotificationIcon(
                            notification.type
                          )
                        )}
                      </div>

                      {!notification.isRead && (
                        <span
                          className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ${getPriorityClass(
                            notification.priority
                          )}`}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-xs ${
                            notification.isRead
                              ? "font-medium text-slate-300"
                              : "font-semibold text-white"
                          }`}
                        >
                          {notification.title}
                        </p>

                        {!notification.isRead && (
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">
                        {notification.message}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] text-slate-600">
                          {formatTime(
                            notification.createdAt
                          )}
                        </span>

                        {notification.href && (
                          <>
                            <span className="text-slate-700">
                              •
                            </span>

                            <span className="flex items-center gap-1 text-[10px] text-cyan-500 opacity-0 transition group-hover:opacity-100">
                              Open
                              <ExternalLink size={9} />
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {notification.isRead && (
                      <Check
                        size={13}
                        className="mt-1 shrink-0 text-slate-700"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.07] px-4 py-2.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/dashboard");
              }}
              className="flex w-full items-center justify-center rounded-lg py-2 text-[11px] font-medium text-slate-500 transition hover:bg-white/[0.04] hover:text-cyan-300"
            >
              View dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}