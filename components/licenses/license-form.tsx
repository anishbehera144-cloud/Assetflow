"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  FileKey2,
  KeyRound,
  Loader2,
  Save,
  StickyNote,
  Users,
} from "lucide-react";

import { createLicense } from "@/app/actions/licenses";

export function LicenseForm() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");

    const result = await createLicense(formData);

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push(`/licenses/${result.licenseId}`);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Basic information */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            License Information
          </h2>

          <p className="mt-1 text-sm text-white/40">
            Enter the basic information for this software license.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="License Name"
            name="name"
            placeholder="Figma Professional"
            icon={<FileKey2 className="h-4 w-4" />}
            required
          />

          <Field
            label="Publisher"
            name="publisher"
            placeholder="Figma"
            icon={<FileKey2 className="h-4 w-4" />}
          />

          <Field
            label="License Key"
            name="licenseKey"
            placeholder="XXXX-XXXX-XXXX-XXXX"
            icon={<KeyRound className="h-4 w-4" />}
          />

          <Field
            label="Total Seats"
            name="totalSeats"
            type="number"
            min="1"
            placeholder="50"
            icon={<Users className="h-4 w-4" />}
            required
          />
        </div>
      </section>

      {/* Dates and status */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            License Lifecycle
          </h2>

          <p className="mt-1 text-sm text-white/40">
            Track purchase, renewal, and current license status.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Field
            label="Purchase Date"
            name="purchaseDate"
            type="date"
            icon={<CalendarDays className="h-4 w-4" />}
          />

          <Field
            label="Renewal Date"
            name="renewalDate"
            type="date"
            icon={<CalendarDays className="h-4 w-4" />}
          />

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-white/70"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              defaultValue="ACTIVE"
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0d13] px-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
            >
              <option value="ACTIVE">Active</option>
              <option value="EXPIRING">Expiring</option>
              <option value="EXPIRED">Expired</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-6 flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-cyan-400" />

          <div>
            <h2 className="text-lg font-semibold text-white">
              Notes
            </h2>

            <p className="text-sm text-white/40">
              Optional internal notes about this license.
            </p>
          </div>
        </div>

        <textarea
          name="notes"
          rows={5}
          placeholder="Add renewal information, vendor details, purchasing notes..."
          className="w-full resize-none rounded-xl border border-white/10 bg-[#0a0d13] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-cyan-400/50"
        />
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/licenses")}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/[0.08] hover:text-white"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Create License
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  icon,
  required = false,
  min,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  required?: boolean;
  min?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 flex items-center gap-2 text-sm font-medium text-white/70"
      >
        {icon}
        {label}

        {required && (
          <span className="text-cyan-400">*</span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        min={min}
        className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0d13] px-3 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-400/50"
      />
    </div>
  );
}