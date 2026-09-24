"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type AuditUser = {
  id: string;
  name: string;
  email: string;
  role: string;
} | null;

type AuditLog = {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  oldValue: unknown;
  newValue: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date | string;
  user: AuditUser;
};

type AuditTableProps = {
  logs: AuditLog[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

function formatDate(value: Date | string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatAction(action: string) {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatRole(role: string) {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getActionStyle(action: string) {
  if (
    action.startsWith("CREATE") ||
    action.includes("ASSIGN") ||
    action.includes("COMPLETE")
  ) {
    return "border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300";
  }

  if (
    action.startsWith("UPDATE") ||
    action.includes("START") ||
    action.includes("PROCESS")
  ) {
    return "border-cyan-400/15 bg-cyan-400/[0.08] text-cyan-300";
  }

  if (
    action.startsWith("DELETE") ||
    action.includes("CANCEL") ||
    action.includes("REVOKE")
  ) {
    return "border-rose-400/15 bg-rose-400/[0.08] text-rose-300";
  }

  return "border-white/[0.08] bg-white/[0.04] text-slate-300";
}

function formatJson(value: unknown) {
  if (value === null || value === undefined) {
    return "No data";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function EmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <Search size={19} className="text-slate-500" />
      </div>

      <h3 className="text-sm font-semibold text-white">
        No audit logs found
      </h3>

      <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
        Try changing your search or filters. Activity recorded by the
        application will appear here.
      </p>
    </div>
  );
}

export function AuditTable({
  logs,
  pagination,
}: AuditTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  function goToPage(page: number) {
    if (page < 1 || page > pagination.totalPages) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(page));

    router.push(`/audit?${params.toString()}`);
  }

  function toggleRow(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  if (logs.length === 0) {
    return <EmptyState />;
  }

  const start =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;

  const end = Math.min(
    pagination.page * pagination.pageSize,
    pagination.total
  );

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1050px]">
          <thead>
            <tr className="border-b border-white/[0.07] bg-white/[0.02]">
              <th className="w-10 px-4 py-3" />

              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Action
              </th>

              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Entity
              </th>

              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                User
              </th>

              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Entity ID
              </th>

              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Date
              </th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => {
              const expanded = expandedId === log.id;

              return (
                <AuditRow
                  key={log.id}
                  log={log}
                  expanded={expanded}
                  onToggle={() => toggleRow(log.id)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/tablet cards */}
      <div className="divide-y divide-white/[0.06] lg:hidden">
        {logs.map((log) => {
          const expanded = expandedId === log.id;

          return (
            <MobileAuditRow
              key={log.id}
              log={log}
              expanded={expanded}
              onToggle={() => toggleRow(log.id)}
            />
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 border-t border-white/[0.07] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-medium text-slate-300">
            {start}
          </span>{" "}
          to{" "}
          <span className="font-medium text-slate-300">
            {end}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-300">
            {pagination.total}
          </span>{" "}
          logs
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-slate-400 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft size={15} />
          </button>

          <div className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/[0.07] px-3 text-xs font-semibold text-cyan-300">
            {pagination.page}
          </div>

          <span className="text-xs text-slate-600">
            of {pagination.totalPages}
          </span>

          <button
            type="button"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-slate-400 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AuditRow({
  log,
  expanded,
  onToggle,
}: {
  log: AuditLog;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className={`border-b border-white/[0.05] transition ${
          expanded
            ? "bg-white/[0.025]"
            : "hover:bg-white/[0.02]"
        }`}
      >
        <td className="px-4 py-3">
          <button
            type="button"
            onClick={onToggle}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
            aria-label={expanded ? "Collapse row" : "Expand row"}
          >
            {expanded ? (
              <ChevronUp size={15} />
            ) : (
              <ChevronDown size={15} />
            )}
          </button>
        </td>

        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] ${getActionStyle(
              log.action
            )}`}
          >
            {formatAction(log.action)}
          </span>
        </td>

        <td className="px-4 py-3">
          <div className="text-xs font-medium text-white">
            {log.entity}
          </div>
        </td>

        <td className="px-4 py-3">
          {log.user ? (
            <div>
              <div className="text-xs font-medium text-slate-200">
                {log.user.name}
              </div>

              <div className="mt-0.5 text-[10px] text-slate-600">
                {formatRole(log.user.role)}
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-600">
              System / Unattributed
            </span>
          )}
        </td>

        <td className="px-4 py-3">
          <span className="font-mono text-[11px] text-slate-500">
            {log.entityId || "—"}
          </span>
        </td>

        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
          {formatDate(log.createdAt)}
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-white/[0.05] bg-[#070a10]">
          <td colSpan={6} className="px-6 py-5">
            <AuditDetails log={log} />
          </td>
        </tr>
      )}
    </>
  );
}

function MobileAuditRow({
  log,
  expanded,
  onToggle,
}: {
  log: AuditLog;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`p-4 transition ${
        expanded ? "bg-white/[0.025]" : ""
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-slate-500">
            {expanded ? (
              <ChevronUp size={15} />
            ) : (
              <ChevronDown size={15} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-lg border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.05em] ${getActionStyle(
                  log.action
                )}`}
              >
                {formatAction(log.action)}
              </span>

              <span className="text-[10px] text-slate-600">
                {formatDate(log.createdAt)}
              </span>
            </div>

            <div className="mt-2 text-sm font-medium text-white">
              {log.entity}
            </div>

            <div className="mt-1 font-mono text-[10px] text-slate-600">
              {log.entityId || "No entity ID"}
            </div>

            <div className="mt-2 text-[11px] text-slate-500">
              {log.user
                ? `${log.user.name} · ${formatRole(log.user.role)}`
                : "System / Unattributed"}
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <AuditDetails log={log} />
        </div>
      )}
    </div>
  );
}

function AuditDetails({ log }: { log: AuditLog }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {/* Old value */}
      <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-black/20">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Previous Value
          </div>
        </div>

        <pre className="max-h-[280px] overflow-auto p-4 font-mono text-[10px] leading-5 text-slate-500">
          {formatJson(log.oldValue)}
        </pre>
      </div>

      {/* New value */}
      <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-black/20">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            New Value
          </div>
        </div>

        <pre className="max-h-[280px] overflow-auto p-4 font-mono text-[10px] leading-5 text-slate-400">
          {formatJson(log.newValue)}
        </pre>
      </div>

      {/* Metadata */}
      <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4 xl:col-span-2">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Request Metadata
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <div className="text-[9px] uppercase tracking-[0.1em] text-slate-600">
              User
            </div>

            <div className="mt-1 text-xs text-slate-300">
              {log.user?.email || "System / Unattributed"}
            </div>
          </div>

          <div>
            <div className="text-[9px] uppercase tracking-[0.1em] text-slate-600">
              IP Address
            </div>

            <div className="mt-1 font-mono text-xs text-slate-400">
              {log.ipAddress || "Not recorded"}
            </div>
          </div>

          <div>
            <div className="text-[9px] uppercase tracking-[0.1em] text-slate-600">
              Entity ID
            </div>

            <div className="mt-1 break-all font-mono text-xs text-slate-400">
              {log.entityId || "Not recorded"}
            </div>
          </div>

          <div>
            <div className="text-[9px] uppercase tracking-[0.1em] text-slate-600">
              Log ID
            </div>

            <div className="mt-1 break-all font-mono text-xs text-slate-400">
              {log.id}
            </div>
          </div>
        </div>

        {log.userAgent && (
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <div className="text-[9px] uppercase tracking-[0.1em] text-slate-600">
              User Agent
            </div>

            <div className="mt-1 break-all font-mono text-[10px] leading-5 text-slate-500">
              {log.userAgent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}