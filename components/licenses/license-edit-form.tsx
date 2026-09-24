"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileKey2,
  Loader2,
  Save,
  Users,
} from "lucide-react";

import { updateLicense } from "@/app/actions/licenses";

type LicenseStatus =
  | "ACTIVE"
  | "EXPIRING"
  | "EXPIRED"
  | "SUSPENDED";

type LicenseData = {
  id: string;
  name: string;
  publisher: string | null;
  licenseKey: string | null;
  totalSeats: number;
  availableSeats: number;
  purchaseDate: string | null;
  renewalDate: string | null;
  status: LicenseStatus;
  notes: string | null;
};

type LicenseEditFormProps = {
  license: LicenseData;
  activeAssignments: number;
};

export function LicenseEditForm({
  license,
  activeAssignments,
}: LicenseEditFormProps) {
  const router = useRouter();

  const [name, setName] = useState<string>(
    license.name
  );

  const [publisher, setPublisher] = useState<string>(
    license.publisher ?? ""
  );

  const [licenseKey, setLicenseKey] =
    useState<string>(
      license.licenseKey ?? ""
    );

  const [totalSeats, setTotalSeats] =
    useState<string>(
      String(license.totalSeats)
    );

  const [purchaseDate, setPurchaseDate] =
    useState<string>(
      license.purchaseDate ?? ""
    );

  const [renewalDate, setRenewalDate] =
    useState<string>(
      license.renewalDate ?? ""
    );

  const [status, setStatus] =
    useState<LicenseStatus>(
      license.status
    );

  const [notes, setNotes] = useState<string>(
    license.notes ?? ""
  );

  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanedName = name.trim();
    const cleanedPublisher = publisher.trim();
    const cleanedLicenseKey =
      licenseKey.trim();
    const cleanedNotes = notes.trim();

    const seats = Number(totalSeats);

    if (!cleanedName) {
      setError("License name is required.");
      return;
    }

    if (
      !Number.isInteger(seats) ||
      seats < 1
    ) {
      setError(
        "Total seats must be a whole number greater than 0."
      );
      return;
    }

    if (seats < activeAssignments) {
      setError(
        `Total seats cannot be lower than ${activeAssignments} active assigned seats.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateLicense(
        license.id,
        {
          name: cleanedName,
          publisher: cleanedPublisher,
          licenseKey: cleanedLicenseKey,
          totalSeats: seats,
          purchaseDate:
            purchaseDate || undefined,
          renewalDate:
            renewalDate || undefined,
          status: status,
          notes: cleanedNotes,
        }
      );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to update the license."
        );

        setIsSubmitting(false);
        return;
      }

      router.push(
        `/licenses/${license.id}`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "updateLicense error:",
        error
      );

      setError(
        "Something went wrong while updating the license."
      );

      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    router.push(
      `/licenses/${license.id}`
    );
  }

  return (
    <div>
      {/* Back button */}
      <button
        type="button"
        onClick={handleCancel}
        disabled={isSubmitting}
        className="mb-6 inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-cyan-400 disabled:opacity-50"
      >
        <ArrowLeft size={14} />
        Back to License
      </button>

      {/* Header */}
      <div className="mb-7">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06] text-cyan-400">
          <FileKey2 size={20} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          Edit License
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Update software license information
          and seat capacity.
        </p>
      </div>

      {/* Active assignments */}
      <div className="mb-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5">
        <div className="flex items-start gap-3">
          <Users
            size={18}
            className="mt-0.5 shrink-0 text-cyan-400"
          />

          <div>
            <p className="text-sm font-medium text-white">
              Active assignments
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              This license currently has{" "}
              <span className="font-semibold text-cyan-400">
                {activeAssignments}
              </span>{" "}
              active assignment
              {activeAssignments === 1
                ? ""
                : "s"}.
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Total seats cannot be reduced
              below this number.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6"
      >
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Information */}
        <div>
          <h2 className="text-sm font-semibold text-white">
            License Information
          </h2>

          <p className="mt-1 text-xs text-slate-600">
            Basic software licensing details
          </p>
        </div>

        {/* License Name */}
        <div className="mt-6">
          <label
            htmlFor="name"
            className="mb-2 block text-xs font-medium text-slate-400"
          >
            License Name
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            disabled={isSubmitting}
            placeholder="e.g. Figma Professional"
            className="w-full rounded-xl border border-white/[0.08] bg-[#0b0f17] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Publisher */}
        <div className="mt-5">
          <label
            htmlFor="publisher"
            className="mb-2 block text-xs font-medium text-slate-400"
          >
            Publisher
          </label>

          <input
            id="publisher"
            type="text"
            value={publisher}
            onChange={(event) =>
              setPublisher(event.target.value)
            }
            disabled={isSubmitting}
            placeholder="e.g. Figma"
            className="w-full rounded-xl border border-white/[0.08] bg-[#0b0f17] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* License Key */}
        <div className="mt-5">
          <label
            htmlFor="licenseKey"
            className="mb-2 block text-xs font-medium text-slate-400"
          >
            License Key
          </label>

          <input
            id="licenseKey"
            type="text"
            value={licenseKey}
            onChange={(event) =>
              setLicenseKey(
                event.target.value
              )
            }
            disabled={isSubmitting}
            placeholder="Optional license key"
            className="w-full rounded-xl border border-white/[0.08] bg-[#0b0f17] px-4 py-3 font-mono text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Total Seats */}
        <div className="mt-5">
          <label
            htmlFor="totalSeats"
            className="mb-2 block text-xs font-medium text-slate-400"
          >
            Total Seats
          </label>

          <input
            id="totalSeats"
            type="number"
            min={Math.max(
              1,
              activeAssignments
            )}
            step={1}
            value={totalSeats}
            onChange={(event) =>
              setTotalSeats(
                event.target.value
              )
            }
            disabled={isSubmitting}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0b0f17] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <p className="mt-2 text-[11px] text-slate-600">
            Minimum seats:{" "}
            {activeAssignments}
          </p>
        </div>

        {/* Dates */}
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="purchaseDate"
              className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400"
            >
              <CalendarDays size={13} />
              Purchase Date
            </label>

            <input
              id="purchaseDate"
              type="date"
              value={purchaseDate}
              onChange={(event) =>
                setPurchaseDate(
                  event.target.value
                )
              }
              disabled={isSubmitting}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0b0f17] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="renewalDate"
              className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400"
            >
              <CalendarDays size={13} />
              Renewal Date
            </label>

            <input
              id="renewalDate"
              type="date"
              value={renewalDate}
              onChange={(event) =>
                setRenewalDate(
                  event.target.value
                )
              }
              disabled={isSubmitting}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0b0f17] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Status */}
        <div className="mt-5">
          <label
            htmlFor="status"
            className="mb-2 block text-xs font-medium text-slate-400"
          >
            License Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as LicenseStatus
              )
            }
            disabled={isSubmitting}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0b0f17] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="ACTIVE">
              Active
            </option>

            <option value="EXPIRING">
              Expiring
            </option>

            <option value="EXPIRED">
              Expired
            </option>

            <option value="SUSPENDED">
              Suspended
            </option>
          </select>
        </div>

        {/* Notes */}
        <div className="mt-5">
          <label
            htmlFor="notes"
            className="mb-2 block text-xs font-medium text-slate-400"
          >
            Notes
          </label>

          <textarea
            id="notes"
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            disabled={isSubmitting}
            rows={5}
            placeholder="Additional license notes..."
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#0b0f17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Buttons */}
        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-xl border border-white/[0.08] px-5 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={14}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}