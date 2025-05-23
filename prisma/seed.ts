import prisma from "../lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  // Admin user
  const saltRounds = 10;
  const hashedPasswordSuperadmin = await bcrypt.hash("12345678A", saltRounds);
  const userAdmin = await prisma.user.create({
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

  const hashedPasswordAdmin = await bcrypt.hash("12345678A", saltRounds);

  await prisma.user.create({
    data: {
      first_name: "1",
      last_name: "Admin",
      email: "admin1@admin.com",
      password: hashedPasswordAdmin,
      country_code: "+60",
      phone_no: "123456789",
      address_1: "Photoversal Studio",
      postcode: "123456",
      state: "Selangor",
      city: "Seri Kembangan",
      is_verified: true,
      role: "ADMIN",
    },
  });

  /**
   * Institution Types
   */
  await prisma.institutionType.create({
    data: {
      name: "Preschool",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  await prisma.institutionType.create({
    data: {
      name: "Primary School",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  /**
   * Standards
   */
  await prisma.standard.create({
    data: {
      name: "Standard 1",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  await prisma.standard.create({
    data: {
      name: "Standard 2",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  await prisma.standard.create({
    data: {
      name: "Standard 3",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  /**
   * Product Types
   */
  await prisma.productType.create({
    data: {
      name: "Individual",
      type: "INDIVIDUAL",
      currency: "RM",
      price: 9,
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  /**
   * Product Variations
   */
  const productVariation = await prisma.productVariation.create({
    data: {
      name: "Gold",
      is_downloadable: true,
      description: "",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  /**
   * Product Variation Options
   */
  await prisma.productVariationOption.create({
    data: {
      name: "Color",
      currency: "RM",
      price: 9,
      description: "",
      productVariation_id: productVariation.id,
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
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
