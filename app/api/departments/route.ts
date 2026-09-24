import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error(
      "GET_DEPARTMENTS_ERROR",
      error
    );

    return NextResponse.json(
      {
        message: "Unable to load departments.",
      },
      {
        status: 500,
      }
    );
  }
}