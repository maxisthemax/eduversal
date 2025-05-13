import prisma from "../lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  // Admin user
  const saltRounds = 10;
  const hashedPasswordSuperadmin = await bcrypt.hash("12345678A", saltRounds);
  await prisma.user.create({
    data: {
      first_name: "Admin 1",
      last_name: "Super",
      email: "superadmin1@admin.com",
      password: hashedPasswordSuperadmin,
      country_code: "+60",
      phone_no: "123456789",
      address_1: "Photoversal Studio",
      postcode: "123456",
      state: "Selangor",
      city: "Seri Kembangan",
      is_verified: true,
      role: "SUPERADMIN",
    },
  });

  await prisma.user.create({
    data: {
      first_name: "Admin 2",
      last_name: "Super",
      email: "superadmin2@admin.com",
      password: hashedPasswordSuperadmin,
      country_code: "+60",
      phone_no: "123456789",
      address_1: "Photoversal Studio",
      postcode: "123456",
      state: "Selangor",
      city: "Seri Kembangan",
      is_verified: true,
      role: "SUPERADMIN",
    },
  });

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "Order" RESTART IDENTITY CASCADE;
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
