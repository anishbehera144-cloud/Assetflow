"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  UserCheck,
} from "lucide-react";

import { assignLicenseToEmployee } from "@/actions/licenses";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  department: {
    name: string;
  } | null;
};

type LicenseAssignmentFormProps = {
  licenseId: string;
  licenseName: string;
  availableSeats: number;
  employees: Employee[];
};

export function LicenseAssignmentForm({
  licenseId,
  licenseName,
  availableSeats,
  employees,
}: LicenseAssignmentFormProps) {
  const router = useRouter();

  const [employeeId, setEmployeeId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!employeeId) {
      setError("Please select an employee.");
      return;
    }

    if (availableSeats <= 0) {
      setError("There are no available seats for this license.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await assignLicenseToEmployee(
        licenseId,
        employeeId,
        notes
      );

      if (!result.success) {
        setError(
          result.error || "Unable to assign the license."
        );
        setIsSubmitting(false);
        return;
      }

      router.push(`/licenses/${licenseId}`);
      router.refresh();
    } catch (error) {
      console.error(
        "License assignment failed:",
        error
      );

      setError(
        "Something went wrong while assigning the license."
      );

      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Seat availability */}
      <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/45">
              License
            </p>

            <p className="mt-1 font-medium text-white">
              {licenseName}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-white/45">
              Available Seats
            </p>

            <p className="mt-1 text-2xl font-semibold text-cyan-400">
              {availableSeats}
            </p>
          </div>
        </div>
      </div>

      {/* Employee */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            Select Employee
          </h2>

          <p className="mt-1 text-sm text-white/40">
            Only active employees can receive software
            licenses.
          </p>
        </div>

        <label
          htmlFor="employee"
          className="mb-2 block text-sm font-medium text-white/70"
        >
          Employee
        </label>

        <select
          id="employee"
          value={employeeId}
          onChange={(event) =>
            setEmployeeId(event.target.value)
          }
          disabled={
            isSubmitting ||
            availableSeats <= 0
          }
          className="h-12 w-full rounded-xl border border-white/10 bg-[#0a0d13] px-3 text-sm text-white outline-none transition focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">
            Select an employee
          </option>

          {employees.map((employee) => (
            <option
              key={employee.id}
              value={employee.id}
            >
              {employee.firstName}{" "}
              {employee.lastName} —{" "}
              {employee.employeeCode}
              {employee.department
                ? ` — ${employee.department.name}`
                : ""}
            </option>
          ))}
        </select>

        {employees.length === 0 && (
          <p className="mt-3 text-sm text-amber-400">
            No active employees are currently
            available.
          </p>
        )}
      </section>

      {/* Notes */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
        <label
          htmlFor="notes"
          className="mb-2 block text-sm font-medium text-white/70"
        >
          Assignment Notes
        </label>

        <textarea
          id="notes"
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          disabled={isSubmitting}
          rows={4}
          placeholder="Optional notes about this assignment..."
          className="w-full resize-none rounded-xl border border-white/10 bg-[#0a0d13] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() =>
            router.push(`/licenses/${licenseId}`)
          }
          className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            isSubmitting ||
            availableSeats <= 0 ||
            employees.length === 0
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Assigning...
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4" />
              Assign License
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* No seats */}
      {availableSeats <= 0 && (
        <p className="text-center text-sm text-amber-400">
          All seats for this license are currently
          allocated.
        </p>
      )}
    </form>
  );
}