"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Loader2,
  Save,
} from "lucide-react";

import {
  createAsset,
  type CreateAssetState,
} from "@/actions/assets";

type Option = {
  id: string;
  name: string;
};

type AssetFormProps = {
  categories: Option[];
  departments: Option[];
  locations: Option[];
};

const initialState: CreateAssetState = {
  success: false,
  message: "",
};

export function AssetForm({
  categories,
  departments,
  locations,
}: AssetFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    createAsset,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/assets");
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-6">

      {/* Message */}
      {state.message && (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border-red-400/20 bg-red-400/10 text-red-300"
          }`}
        >
          {state.success ? (
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}

          <span>{state.message}</span>
        </div>
      )}

      {/* Basic Information */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <SectionHeading
          number="01"
          title="Basic Information"
          description="Identify the asset and define its classification."
        />

        <div className="mt-6 grid gap-5 md:grid-cols-2">

          <Field
            label="Asset Tag"
            name="assetTag"
            placeholder="AST-10016"
            required
            error={state.errors?.assetTag?.[0]}
          />

          <SelectField
            label="Asset Type"
            name="assetType"
            required
            options={[
              ["LAPTOP", "Laptop"],
              ["DESKTOP", "Desktop"],
              ["MONITOR", "Monitor"],
              ["MOBILE", "Mobile"],
              ["TABLET", "Tablet"],
              ["PERIPHERAL", "Peripheral"],
              ["NETWORK_DEVICE", "Network Device"],
              ["SOFTWARE", "Software"],
              ["OTHER", "Other"],
            ]}
            error={state.errors?.assetType?.[0]}
          />

          <SelectField
            label="Category"
            name="categoryId"
            required
            options={categories.map((category) => [
              category.id,
              category.name,
            ])}
            error={state.errors?.categoryId?.[0]}
          />

          <Field
            label="Manufacturer"
            name="manufacturer"
            placeholder="Apple, Dell, Lenovo..."
            error={state.errors?.manufacturer?.[0]}
          />

          <Field
            label="Model"
            name="model"
            placeholder="MacBook Pro 14"
            error={state.errors?.model?.[0]}
          />

          <Field
            label="Serial Number"
            name="serialNumber"
            placeholder="C02XXXXXXXX"
            error={state.errors?.serialNumber?.[0]}
          />
        </div>
      </section>

      {/* Organization */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <SectionHeading
          number="02"
          title="Organization"
          description="Associate the asset with its organizational location."
        />

        <div className="mt-6 grid gap-5 md:grid-cols-2">

          <SelectField
            label="Department"
            name="departmentId"
            options={[
              ["", "No department"],
              ...departments.map((department) => [
                department.id,
                department.name,
              ]),
            ]}
          />

          <SelectField
            label="Location"
            name="locationId"
            options={[
              ["", "No location"],
              ...locations.map((location) => [
                location.id,
                location.name,
              ]),
            ]}
          />
        </div>
      </section>

      {/* Purchase and Warranty */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <SectionHeading
          number="03"
          title="Purchase & Warranty"
          description="Record financial and warranty information."
        />

        <div className="mt-6 grid gap-5 md:grid-cols-3">

          <Field
            label="Purchase Date"
            name="purchaseDate"
            type="date"
          />

          <Field
            label="Purchase Price"
            name="purchasePrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="999.99"
          />

          <Field
            label="Warranty Expiry"
            name="warrantyExpiry"
            type="date"
          />
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <SectionHeading
          number="04"
          title="Notes"
          description="Add optional internal information."
        />

        <div className="mt-6">
          <label
            htmlFor="notes"
            className="mb-2 block text-xs font-medium text-slate-400"
          >
            Internal Notes
          </label>

          <textarea
            id="notes"
            name="notes"
            rows={5}
            placeholder="Add asset notes, configuration information, purchase details..."
            className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={() => router.push("/assets")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </button>

        <button
          type="submit"
          disabled={pending || state.success}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : state.success ? (
            <>
              <Check className="h-4 w-4" />
              Created
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Create Asset
            </>
          )}
        </button>

      </div>
    </form>
  );
}

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-xs font-semibold text-cyan-300">
        {number}
      </div>

      <div>
        <h2 className="font-medium text-white">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  error,
  step,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  step?: string;
  min?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-medium text-slate-400"
      >
        {label}

        {required && (
          <span className="ml-1 text-cyan-400">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
        className={`h-11 w-full rounded-xl border bg-black/20 px-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40 ${
          error
            ? "border-red-400/40"
            : "border-white/10"
        }`}
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
  error,
}: {
  label: string;
  name: string;
  options: string[][];
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-medium text-slate-400"
      >
        {label}

        {required && (
          <span className="ml-1 text-cyan-400">
            *
          </span>
        )}
      </label>

      <select
        id={name}
        name={name}
        required={required}
        className={`h-11 w-full rounded-xl border bg-[#0a0d13] px-3.5 text-sm text-slate-300 outline-none focus:border-cyan-400/40 ${
          error
            ? "border-red-400/40"
            : "border-white/10"
        }`}
      >
        <option value="">
          Select {label}
        </option>

        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}