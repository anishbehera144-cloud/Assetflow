"use client";

import {
  Bell,
  ChevronRight,
  Database,
  KeyRound,
  Palette,
  Settings as SettingsIcon,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  FileText,
  Download,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const sections = [
  {
    id: "appearance",
    title: "Appearance",
    description:
      "Control the visual appearance and interface preferences.",
    icon: Palette,
    items: [
      {
        label: "Theme",
        value: "Dark",
        description: "Current application theme",
        action: "theme",
      },
      {
        label: "Interface density",
        value: "Compact",
        description: "Optimized for high-density enterprise tables",
        action: "density",
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    description:
      "Configure operational alerts and notification preferences.",
    icon: Bell,
    items: [
      {
        label: "Return requests",
        value: "Enabled",
        description: "Receive alerts for pending asset returns",
        action: "return-requests",
      },
      {
        label: "Maintenance",
        value: "Enabled",
        description: "Receive maintenance status notifications",
        action: "maintenance",
      },
      {
        label: "License renewals",
        value: "Enabled",
        description: "Receive upcoming renewal notifications",
        action: "licenses",
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    description:
      "Review authentication and access-control configuration.",
    icon: ShieldCheck,
    items: [
      {
        label: "Role-based access",
        value: "Enabled",
        description: "Access is controlled through assigned roles",
        action: "rbac",
      },
      {
        label: "Audit logging",
        value: "Enabled",
        description:
          "Administrative and operational actions are recorded",
        action: "audit",
      },
      {
        label: "Session protection",
        value: "Enabled",
        description:
          "Secure server-side authentication controls",
        action: "sessions",
      },
    ],
  },
];

export default function SettingsPage() {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  function openPanel(action: string) {
    setActivePanel(action);
  }

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-cyan-400">
            <SettingsIcon size={16} />

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
              System Configuration
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your account, application preferences, security,
            notifications, and system configuration.
          </p>
        </div>

        {/* Quick navigation */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SettingsShortcut
            href="#profile"
            icon={UserRound}
            label="Profile"
            description="Account information"
          />

          <SettingsShortcut
            href="#security"
            icon={ShieldCheck}
            label="Security"
            description="Access & authentication"
          />

          <SettingsShortcut
            href="#notifications"
            icon={Bell}
            label="Notifications"
            description="Alert preferences"
          />

          <SettingsShortcut
            href="#system"
            icon={Database}
            label="System"
            description="Application configuration"
          />
        </div>

        {/* Profile */}
        <section
          id="profile"
          className="mb-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]"
        >
          <SectionHeader
            icon={UserRound}
            title="Profile"
            description="Manage your ASSETFLOW account information."
          />

          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Link
              href="/settings/profile"
              className="group rounded-xl border border-white/[0.06] bg-black/20 p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.03]"
            >
              <div className="mb-3 flex items-center justify-between">
                <UserRound
                  size={16}
                  className="text-slate-500 group-hover:text-cyan-400"
                />

                <ChevronRight
                  size={15}
                  className="text-slate-700 transition group-hover:text-cyan-400"
                />
              </div>

              <p className="text-xs font-medium text-slate-200">
                Account information
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-600">
                Update your name, email, phone number and other
                profile information.
              </p>
            </Link>

            <Link
              href="/settings/security"
              className="group rounded-xl border border-white/[0.06] bg-black/20 p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.03]"
            >
              <div className="mb-3 flex items-center justify-between">
                <KeyRound
                  size={16}
                  className="text-slate-500 group-hover:text-cyan-400"
                />

                <ChevronRight
                  size={15}
                  className="text-slate-700 transition group-hover:text-cyan-400"
                />
              </div>

              <p className="text-xs font-medium text-slate-200">
                Password & security
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-600">
                Change your password and review account security.
              </p>
            </Link>
          </div>
        </section>

        {/* Configuration sections */}
        <div className="space-y-5">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <section
                key={section.id}
                id={section.id}
                className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]"
              >
                <div className="flex items-start gap-4 border-b border-white/[0.06] px-5 py-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.05]">
                    <Icon
                      size={17}
                      className="text-cyan-400"
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      {section.title}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {section.description}
                    </p>
                  </div>
                </div>

                <div>
                  {section.items.map((item, index) => (
                    <div
                      key={item.label}
                      className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                        index !== section.items.length - 1
                          ? "border-b border-white/[0.05]"
                          : ""
                      }`}
                    >
                      <div>
                        <p className="text-xs font-medium text-slate-200">
                          {item.label}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-600">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.05] px-2.5 py-1.5 text-[10px] font-medium text-emerald-300">
                          {item.value}
                        </span>

                        <button
                          type="button"
                          onClick={() => openPanel(item.action)}
                          className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-2 text-slate-500 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.04] hover:text-cyan-400"
                          aria-label={`Configure ${item.label}`}
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {/* System */}
          <section
            id="system"
            className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]"
          >
            <SectionHeader
              icon={Database}
              title="System"
              description="Application-level tools and administration."
            />

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Link
                href="/reports"
                className="group rounded-xl border border-white/[0.06] bg-black/20 p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.03]"
              >
                <FileText
                  size={16}
                  className="mb-3 text-slate-500 group-hover:text-cyan-400"
                />

                <p className="text-xs font-medium text-slate-200">
                  Reports
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-600">
                  View system reports and operational analytics.
                </p>
              </Link>

              <Link
                href="/audit"
                className="group rounded-xl border border-white/[0.06] bg-black/20 p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.03]"
              >
                <ShieldCheck
                  size={16}
                  className="mb-3 text-slate-500 group-hover:text-cyan-400"
                />

                <p className="text-xs font-medium text-slate-200">
                  Audit logs
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-600">
                  Review administrative and operational activity.
                </p>
              </Link>
            </div>
          </section>

          {/* Advanced */}
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <div className="flex items-start gap-4 px-5 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-400/[0.05]">
                <SlidersHorizontal
                  size={17}
                  className="text-violet-400"
                />
              </div>

              <div className="flex-1">
                <h2 className="text-sm font-semibold text-white">
                  Advanced Configuration
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Administrative tools for integrations and data
                  management.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/settings/integrations"
                    className="group rounded-xl border border-white/[0.06] bg-black/20 p-4 transition hover:border-violet-400/20 hover:bg-white/[0.03]"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <KeyRound
                        size={14}
                        className="text-slate-500 group-hover:text-violet-400"
                      />

                      <ChevronRight
                        size={14}
                        className="text-slate-700 group-hover:text-violet-400"
                      />
                    </div>

                    <span className="text-xs font-medium text-slate-300">
                      API & Integrations
                    </span>

                    <p className="mt-1 text-[11px] leading-5 text-slate-600">
                      Configure external integrations and API
                      access.
                    </p>
                  </Link>

                  <Link
                    href="/settings/data"
                    className="group rounded-xl border border-white/[0.06] bg-black/20 p-4 transition hover:border-violet-400/20 hover:bg-white/[0.03]"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Database
                        size={14}
                        className="text-slate-500 group-hover:text-violet-400"
                      />

                      <ChevronRight
                        size={14}
                        className="text-slate-700 group-hover:text-violet-400"
                      />
                    </div>

                    <span className="text-xs font-medium text-slate-300">
                      Data Management
                    </span>

                    <p className="mt-1 text-[11px] leading-5 text-slate-600">
                      Manage imports, exports and system data.
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Configuration feedback */}
        {activePanel && (
          <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-cyan-400/20 bg-[#0b111b] px-5 py-4 shadow-2xl shadow-black/40">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10">
                <SettingsIcon
                  size={15}
                  className="text-cyan-400"
                />
              </div>

              <div className="flex-1">
                <p className="text-xs font-semibold text-white">
                  Configuration selected
                </p>

                <p className="mt-1 text-[11px] text-slate-500">
                  {activePanel.replaceAll("-", " ")} settings are
                  ready to be configured.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActivePanel(null)}
                className="text-slate-600 transition hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 border-t border-white/[0.05] pt-5">
          <div className="flex flex-col gap-2 text-[10px] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <span>ASSETFLOW Enterprise Asset Management</span>
            <span>System configuration</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-white/[0.06] px-5 py-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.05]">
        <Icon size={17} className="text-cyan-400" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-white">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function SettingsShortcut({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: typeof UserRound;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-left transition hover:border-cyan-400/15 hover:bg-white/[0.04]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025]">
        <Icon
          size={15}
          className="text-slate-500 transition group-hover:text-cyan-400"
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-300">
          {label}
        </p>

        <p className="mt-0.5 truncate text-[10px] text-slate-600">
          {description}
        </p>
      </div>
    </Link>
  );
}