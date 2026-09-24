"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Loader2,
  RotateCcw,
} from "lucide-react";

import { revokeLicenseAssignment } from "@/actions/licenses";

type Props = {
  assignmentId: string;
  employeeName: string;
};

export function RevokeLicenseButton({
  assignmentId,
  employeeName,
}: Props) {
  const router = useRouter();

  const [isRevoking, setIsRevoking] =
    useState(false);

  const [error, setError] = useState("");

  async function handleRevoke() {
    const confirmed = window.confirm(
      `Revoke this license from ${employeeName}?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setIsRevoking(true);

    try {
      const result =
        await revokeLicenseAssignment(
          assignmentId
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to revoke the license."
        );
        setIsRevoking(false);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Failed to revoke license:",
        error
      );

      setError(
        "Something went wrong while revoking the license."
      );

      setIsRevoking(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleRevoke}
        disabled={isRevoking}
        className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/[0.05] px-3 py-2 text-xs font-medium text-red-400 transition hover:border-red-400/30 hover:bg-red-400/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRevoking ? (
          <>
            <Loader2
              size={13}
              className="animate-spin"
            />
            Revoking...
          </>
        ) : (
          <>
            <RotateCcw size={13} />
            Revoke
          </>
        )}
      </button>

      {error && (
        <div className="max-w-[220px] rounded-lg border border-red-400/20 bg-red-400/[0.05] px-3 py-2 text-right text-[11px] text-red-400">
          <div className="flex items-start gap-2">
            <AlertTriangle
              size={13}
              className="mt-0.5 shrink-0"
            />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}