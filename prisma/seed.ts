import "dotenv/config";

import {
  PrismaClient,
  AssetStatus,
  AssetType,
  AllocationStatus,
} from "@prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting ASSETFLOW database seed...\n");

  // ---------------------------------------------------------
  // DEPARTMENTS
  // ---------------------------------------------------------

  const engineering = await prisma.department.upsert({
    where: {
      code: "ENG",
    },
    update: {},
    create: {
      name: "Engineering",
      code: "ENG",
    },
  });

  const design = await prisma.department.upsert({
    where: {
      code: "DES",
    },
    update: {},
    create: {
      name: "Design",
      code: "DES",
    },
  });

  const marketing = await prisma.department.upsert({
    where: {
      code: "MKT",
    },
    update: {},
    create: {
      name: "Marketing",
      code: "MKT",
    },
  });

  const hr = await prisma.department.upsert({
    where: {
      code: "HR",
    },
    update: {},
    create: {
      name: "Human Resources",
      code: "HR",
    },
  });

  const finance = await prisma.department.upsert({
    where: {
      code: "FIN",
    },
    update: {},
    create: {
      name: "Finance",
      code: "FIN",
    },
  });

  console.log("✓ Departments created");

  // ---------------------------------------------------------
  // ASSET CATEGORIES
  // ---------------------------------------------------------

  const laptops = await prisma.assetCategory.upsert({
    where: {
      name: "Laptops",
    },
    update: {},
    create: {
      name: "Laptops",
      description: "Company laptops and developer workstations",
    },
  });

  const monitors = await prisma.assetCategory.upsert({
    where: {
      name: "Monitors",
    },
    update: {},
    create: {
      name: "Monitors",
      description: "External displays and professional monitors",
    },
  });

  const mobile = await prisma.assetCategory.upsert({
    where: {
      name: "Mobile Devices",
    },
    update: {},
    create: {
      name: "Mobile Devices",
      description: "Company smartphones and mobile devices",
    },
  });

  const peripherals = await prisma.assetCategory.upsert({
    where: {
      name: "Peripherals",
    },
    update: {},
    create: {
      name: "Peripherals",
      description: "Keyboards, mice, docks and other peripherals",
    },
  });

  const network = await prisma.assetCategory.upsert({
    where: {
      name: "Network Equipment",
    },
    update: {},
    create: {
      name: "Network Equipment",
      description: "Routers, switches and networking equipment",
    },
  });

  console.log("✓ Asset categories created");

  // ---------------------------------------------------------
  // LOCATIONS
  // ---------------------------------------------------------

  const headquarters = await prisma.location.upsert({
    where: {
      name: "Headquarters",
    },
    update: {},
    create: {
      name: "Headquarters",
      building: "Main Building",
      floor: "1",
      room: "IT Storage",
    },
  });

  const engineeringLab = await prisma.location.upsert({
    where: {
      name: "Engineering Lab",
    },
    update: {},
    create: {
      name: "Engineering Lab",
      building: "Main Building",
      floor: "3",
      room: "Lab 301",
    },
  });

  const designStudio = await prisma.location.upsert({
    where: {
      name: "Design Studio",
    },
    update: {},
    create: {
      name: "Design Studio",
      building: "Main Building",
      floor: "2",
      room: "Studio 201",
    },
  });

  console.log("✓ Locations created");

  // ---------------------------------------------------------
  // EMPLOYEES
  // ---------------------------------------------------------

  const rahul = await prisma.employee.upsert({
    where: {
      employeeCode: "EMP-1001",
    },
    update: {},
    create: {
      employeeCode: "EMP-1001",
      firstName: "Rahul",
      lastName: "Sharma",
      email: "rahul.sharma@example.com",
      jobTitle: "Senior Software Engineer",
      departmentId: engineering.id,
    },
  });

  const priya = await prisma.employee.upsert({
    where: {
      employeeCode: "EMP-1002",
    },
    update: {},
    create: {
      employeeCode: "EMP-1002",
      firstName: "Priya",
      lastName: "Das",
      email: "priya.das@example.com",
      jobTitle: "Product Designer",
      departmentId: design.id,
    },
  });

  const arjun = await prisma.employee.upsert({
    where: {
      employeeCode: "EMP-1003",
    },
    update: {},
    create: {
      employeeCode: "EMP-1003",
      firstName: "Arjun",
      lastName: "Patel",
      email: "arjun.patel@example.com",
      jobTitle: "Software Engineer",
      departmentId: engineering.id,
    },
  });

  const neha = await prisma.employee.upsert({
    where: {
      employeeCode: "EMP-1004",
    },
    update: {},
    create: {
      employeeCode: "EMP-1004",
      firstName: "Neha",
      lastName: "Singh",
      email: "neha.singh@example.com",
      jobTitle: "Marketing Manager",
      departmentId: marketing.id,
    },
  });

  const amit = await prisma.employee.upsert({
    where: {
      employeeCode: "EMP-1005",
    },
    update: {},
    create: {
      employeeCode: "EMP-1005",
      firstName: "Amit",
      lastName: "Verma",
      email: "amit.verma@example.com",
      jobTitle: "Finance Analyst",
      departmentId: finance.id,
    },
  });

  const sneha = await prisma.employee.upsert({
    where: {
      employeeCode: "EMP-1006",
    },
    update: {},
    create: {
      employeeCode: "EMP-1006",
      firstName: "Sneha",
      lastName: "Mishra",
      email: "sneha.mishra@example.com",
      jobTitle: "HR Specialist",
      departmentId: hr.id,
    },
  });

  console.log("✓ Employees created");

  // ---------------------------------------------------------
  // ASSETS
  // ---------------------------------------------------------

  const assetData = [
    {
      assetTag: "AST-10001",
      assetType: AssetType.LAPTOP,
      categoryId: laptops.id,
      manufacturer: "Apple",
      model: "MacBook Pro 14",
      serialNumber: "MBP14-001",
      departmentId: engineering.id,
      locationId: engineeringLab.id,
      status: AssetStatus.ASSIGNED,
    },

    {
      assetTag: "AST-10002",
      assetType: AssetType.LAPTOP,
      categoryId: laptops.id,
      manufacturer: "Lenovo",
      model: "ThinkPad X1 Carbon",
      serialNumber: "X1C-002",
      departmentId: engineering.id,
      locationId: engineeringLab.id,
      status: AssetStatus.IN_REPAIR,
    },

    {
      assetTag: "AST-10003",
      assetType: AssetType.LAPTOP,
      categoryId: laptops.id,
      manufacturer: "Dell",
      model: "XPS 15",
      serialNumber: "XPS15-003",
      departmentId: engineering.id,
      locationId: engineeringLab.id,
      status: AssetStatus.AVAILABLE,
    },

    {
      assetTag: "AST-10004",
      assetType: AssetType.MONITOR,
      categoryId: monitors.id,
      manufacturer: "Dell",
      model: "UltraSharp U2723QE",
      serialNumber: "U2723-004",
      departmentId: design.id,
      locationId: designStudio.id,
      status: AssetStatus.ASSIGNED,
    },

    {
      assetTag: "AST-10005",
      assetType: AssetType.MONITOR,
      categoryId: monitors.id,
      manufacturer: "LG",
      model: "UltraFine 27",
      serialNumber: "LG27-005",
      departmentId: design.id,
      locationId: designStudio.id,
      status: AssetStatus.AVAILABLE,
    },

    {
      assetTag: "AST-10006",
      assetType: AssetType.MOBILE,
      categoryId: mobile.id,
      manufacturer: "Apple",
      model: "iPhone 15 Pro",
      serialNumber: "IPH15-006",
      departmentId: marketing.id,
      locationId: headquarters.id,
      status: AssetStatus.RETURN_REQUESTED,
    },

    {
      assetTag: "AST-10007",
      assetType: AssetType.MOBILE,
      categoryId: mobile.id,
      manufacturer: "Samsung",
      model: "Galaxy S24",
      serialNumber: "SGS24-007",
      departmentId: marketing.id,
      locationId: headquarters.id,
      status: AssetStatus.ASSIGNED,
    },

    {
      assetTag: "AST-10008",
      assetType: AssetType.PERIPHERAL,
      categoryId: peripherals.id,
      manufacturer: "Logitech",
      model: "MX Master 3S",
      serialNumber: "MX3S-008",
      departmentId: engineering.id,
      locationId: headquarters.id,
      status: AssetStatus.AVAILABLE,
    },

    {
      assetTag: "AST-10009",
      assetType: AssetType.PERIPHERAL,
      categoryId: peripherals.id,
      manufacturer: "Logitech",
      model: "MX Keys",
      serialNumber: "MXK-009",
      departmentId: design.id,
      locationId: designStudio.id,
      status: AssetStatus.ASSIGNED,
    },

    {
      assetTag: "AST-10010",
      assetType: AssetType.PERIPHERAL,
      categoryId: peripherals.id,
      manufacturer: "CalDigit",
      model: "TS4 Thunderbolt Dock",
      serialNumber: "TS4-010",
      departmentId: engineering.id,
      locationId: engineeringLab.id,
      status: AssetStatus.AVAILABLE,
    },

    {
      assetTag: "AST-10011",
      assetType: AssetType.NETWORK_DEVICE,
      categoryId: network.id,
      manufacturer: "Cisco",
      model: "Catalyst 9200",
      serialNumber: "CAT9200-011",
      departmentId: engineering.id,
      locationId: headquarters.id,
      status: AssetStatus.ASSIGNED,
    },

    {
      assetTag: "AST-10012",
      assetType: AssetType.LAPTOP,
      categoryId: laptops.id,
      manufacturer: "Dell",
      model: "Latitude 7440",
      serialNumber: "LAT7440-012",
      departmentId: finance.id,
      locationId: headquarters.id,
      status: AssetStatus.ASSIGNED,
    },

    {
      assetTag: "AST-10013",
      assetType: AssetType.LAPTOP,
      categoryId: laptops.id,
      manufacturer: "HP",
      model: "EliteBook 840",
      serialNumber: "HP840-013",
      departmentId: hr.id,
      locationId: headquarters.id,
      status: AssetStatus.AVAILABLE,
    },

    {
      assetTag: "AST-10014",
      assetType: AssetType.MONITOR,
      categoryId: monitors.id,
      manufacturer: "Samsung",
      model: "ViewFinity S7",
      serialNumber: "S7-014",
      departmentId: finance.id,
      locationId: headquarters.id,
      status: AssetStatus.AVAILABLE,
    },

    {
      assetTag: "AST-10015",
      assetType: AssetType.LAPTOP,
      categoryId: laptops.id,
      manufacturer: "Apple",
      model: "MacBook Air M3",
      serialNumber: "MBA-M3-015",
      departmentId: engineering.id,
      locationId: engineeringLab.id,
      status: AssetStatus.RETIRED,
    },
  ];

  for (const asset of assetData) {
    await prisma.asset.upsert({
      where: {
        assetTag: asset.assetTag,
      },
      update: {
        status: asset.status,
      },
      create: {
        ...asset,
        purchaseDate: new Date("2025-01-15"),
        purchasePrice: 1250,
        warrantyExpiry: new Date("2028-01-15"),
      },
    });
  }

  console.log("✓ Assets created");

  // ---------------------------------------------------------
  // ALLOCATIONS
  // ---------------------------------------------------------

  const ast10001 = await prisma.asset.findUniqueOrThrow({
    where: { assetTag: "AST-10001" },
  });

  const ast10004 = await prisma.asset.findUniqueOrThrow({
    where: { assetTag: "AST-10004" },
  });

  const ast10007 = await prisma.asset.findUniqueOrThrow({
    where: { assetTag: "AST-10007" },
  });

  const ast10009 = await prisma.asset.findUniqueOrThrow({
    where: { assetTag: "AST-10009" },
  });

  const ast10012 = await prisma.asset.findUniqueOrThrow({
    where: { assetTag: "AST-10012" },
  });

  await prisma.allocation.upsert({
    where: {
      id: "allocation-demo-001",
    },
    update: {},
    create: {
      id: "allocation-demo-001",
      assetId: ast10001.id,
      employeeId: rahul.id,
      assignedAt: new Date("2026-08-01"),
      conditionAtCheckout: "Excellent",
      status: AllocationStatus.ACTIVE,
    },
  });

  await prisma.allocation.upsert({
    where: {
      id: "allocation-demo-002",
    },
    update: {},
    create: {
      id: "allocation-demo-002",
      assetId: ast10004.id,
      employeeId: priya.id,
      assignedAt: new Date("2026-07-15"),
      conditionAtCheckout: "Excellent",
      status: AllocationStatus.ACTIVE,
    },
  });

  await prisma.allocation.upsert({
    where: {
      id: "allocation-demo-003",
    },
    update: {},
    create: {
      id: "allocation-demo-003",
      assetId: ast10007.id,
      employeeId: neha.id,
      assignedAt: new Date("2026-08-20"),
      conditionAtCheckout: "Good",
      status: AllocationStatus.ACTIVE,
    },
  });

  await prisma.allocation.upsert({
    where: {
      id: "allocation-demo-004",
    },
    update: {},
    create: {
      id: "allocation-demo-004",
      assetId: ast10009.id,
      employeeId: priya.id,
      assignedAt: new Date("2026-06-10"),
      conditionAtCheckout: "Excellent",
      status: AllocationStatus.ACTIVE,
    },
  });

  await prisma.allocation.upsert({
    where: {
      id: "allocation-demo-005",
    },
    update: {},
    create: {
      id: "allocation-demo-005",
      assetId: ast10012.id,
      employeeId: amit.id,
      assignedAt: new Date("2026-07-01"),
      conditionAtCheckout: "Good",
      status: AllocationStatus.ACTIVE,
    },
  });

  console.log("✓ Allocations created");

  // ---------------------------------------------------------
  // MAINTENANCE
  // ---------------------------------------------------------

  await prisma.maintenanceRecord.upsert({
    where: {
      id: "maintenance-demo-001",
    },
    update: {},
    create: {
      id: "maintenance-demo-001",
      assetId: (
        await prisma.asset.findUniqueOrThrow({
          where: { assetTag: "AST-10002" },
        })
      ).id,
      vendor: "Authorized Service Center",
      issueDescription: "Battery degradation and intermittent shutdowns",
      status: "IN_PROGRESS",
      startedAt: new Date("2026-09-10"),
    },
  });

  console.log("✓ Maintenance record created");

  // ---------------------------------------------------------
  // SOFTWARE LICENSE
  // ---------------------------------------------------------

  const license = await prisma.softwareLicense.upsert({
    where: {
      id: "license-demo-001",
    },
    update: {},
    create: {
      id: "license-demo-001",
      name: "Figma Professional",
      publisher: "Figma",
      totalSeats: 50,
      availableSeats: 43,
      purchaseDate: new Date("2026-01-01"),
      renewalDate: new Date("2027-01-01"),
      status: "ACTIVE",
    },
  });

  await prisma.licenseAssignment.upsert({
    where: {
      id: "license-assignment-demo-001",
    },
    update: {},
    create: {
      id: "license-assignment-demo-001",
      licenseId: license.id,
      employeeId: priya.id,
      assignedAt: new Date("2026-02-01"),
    },
  });

  console.log("✓ Software license created");

  console.log("\n🎉 ASSETFLOW database seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("\n❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });