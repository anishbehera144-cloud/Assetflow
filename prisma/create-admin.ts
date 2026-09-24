import "dotenv/config";
import { hash } from "bcryptjs";

import { prisma } from "../lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = "ASSETFLOW Administrator";

  if (!email) {
    throw new Error(
      "ADMIN_EMAIL is missing from .env"
    );
  }

  if (!password || password.length < 12) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 12 characters."
    );
  }

  const hashedPassword = await hash(password, 12);

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    const user = await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        name,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log(
      `Updated ADMIN user: ${user.email}`
    );

    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "USER_CREATED",
      entity: "User",
      entityId: user.id,
      newValue: {
        email: user.email,
        role: user.role,
      },
    },
  });

  console.log(
    `Created ADMIN user: ${user.email}`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });