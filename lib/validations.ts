import { z } from "zod";

export const assetSchema = z.object({
  assetTag: z
    .string()
    .min(2, "Asset tag must be at least 2 characters")
    .max(50, "Asset tag is too long"),

  assetType: z.enum([
    "LAPTOP",
    "DESKTOP",
    "MONITOR",
    "MOBILE",
    "TABLET",
    "PERIPHERAL",
    "NETWORK_DEVICE",
    "SOFTWARE",
    "OTHER",
  ]),

  categoryId: z
    .string()
    .min(1, "Category is required"),

  manufacturer: z
    .string()
    .max(100)
    .optional(),

  model: z
    .string()
    .max(100)
    .optional(),

  serialNumber: z
    .string()
    .max(100)
    .optional(),

  purchaseDate: z
    .string()
    .optional(),

  purchasePrice: z
    .coerce
    .number()
    .nonnegative()
    .optional(),

  warrantyExpiry: z
    .string()
    .optional(),

  departmentId: z
    .string()
    .optional(),

  locationId: z
    .string()
    .optional(),

  notes: z
    .string()
    .max(2000)
    .optional(),
});

export type AssetFormData = z.infer<typeof assetSchema>;
export const licenseSchema = z
  .object({
    name: z
      .string()
      .min(2, "License name must be at least 2 characters")
      .max(150, "License name is too long"),

    publisher: z
      .string()
      .max(100, "Publisher name is too long")
      .optional(),

    licenseKey: z
      .string()
      .max(500, "License key is too long")
      .optional(),

    totalSeats: z.coerce
      .number()
      .int("Total seats must be a whole number")
      .min(1, "Total seats must be at least 1"),

    purchaseDate: z.string().optional(),

    renewalDate: z.string().optional(),

    status: z.enum([
      "ACTIVE",
      "EXPIRING",
      "EXPIRED",
      "SUSPENDED",
    ]),

    notes: z
      .string()
      .max(2000, "Notes are too long")
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.purchaseDate || !data.renewalDate) {
        return true;
      }

      return new Date(data.renewalDate) >= new Date(data.purchaseDate);
    },
    {
      message: "Renewal date cannot be before purchase date",
      path: ["renewalDate"],
    }
  );

export type LicenseFormData = z.infer<typeof licenseSchema>;