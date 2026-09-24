import Link from "next/link";
import { ArrowLeft, FileKey2 } from "lucide-react";

import { LicenseForm } from "@/components/licenses/license-form";

export default function NewLicensePage() {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px] space-y-6">
        <Link
          href="/licenses"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Licenses
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
              <FileKey2 className="h-6 w-6 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Add Software License
              </h1>

              <p className="mt-1 text-sm text-white/45">
                Add a new software license and configure its seat capacity.
              </p>
            </div>
          </div>
        </div>

        <LicenseForm />
      </div>
    </div>
  );
}