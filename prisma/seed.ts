import prisma from "../lib/prisma";

async function main() {
  /**
   * 1. Institution Types
   */
  const preschool = await prisma.institutionType.create({
    data: {
      name: "Preschool",
    },
  });

  const primary = await prisma.institutionType.create({
    data: {
      name: "Primary School",
    },
  });

  /**
   * 2. Institutions
   *    - references one of the InstitutionTypes
   */
  const institutionA = await prisma.institution.create({
    data: {
      name: "Tadika ABC",
      code: "TABC",
      type: {
        connect: { id: preschool.id },
      },
    },
  });

  const institutionB = await prisma.institution.create({
    data: {
      name: "Sekolah Menengah Kebangsaan Damansara Utama",
      code: "SMKDU",
      type: {
        connect: { id: primary.id },
      },
    },
  });

  /**
   * 3. Academic Years
   *    - each references an Institution
   */
  const year2024_1 = await prisma.academicYear.create({
    data: {
      name: "2024",
      institution: {
        connect: { id: institutionA.id },
      },
    },
  });

  const year2025_1 = await prisma.academicYear.create({
    data: {
      name: "2024",
      institution: {
        connect: { id: institutionA.id },
      },
    },
  });

  const year2024_2 = await prisma.academicYear.create({
    data: {
      name: "2024",
      institution: {
        connect: { id: institutionB.id },
      },
    },
  });

  /**
   * 4. Standards
   */
  const standardOne = await prisma.standard.create({
    data: {
      name: "Standard 1",
    },
  });

  const standardTwo = await prisma.standard.create({
    data: {
      name: "Standard 2",
    },
  });

  const standardThree = await prisma.standard.create({
    data: {
      name: "Standard 3",
    },
  });

  /**
   * 5. Classes for 2024
   *    - references Standard and AcademicYear
   */
  const classA = await prisma.class.create({
    data: {
      name: "Class A",
      access_code: "CLASS-A-2024",
      standard: {
        connect: { id: standardOne.id },
      },
      academicYear: {
        connect: { id: year2024_1.id },
      },
      start_date: new Date("2024-09-01"),
      end_date: new Date("2025-06-20"),
    },
  });

  const classB = await prisma.class.create({
    data: {
      name: "Class B",
      access_code: "CLASS-B-2024",
      standard: {
        connect: { id: standardOne.id },
      },
      academicYear: {
        connect: { id: year2024_2.id },
      },
      start_date: new Date("2024-09-01"),
      end_date: new Date("2025-06-20"),
    },
  });

  const classC = await prisma.class.create({
    data: {
      name: "Class C",
      access_code: "CLASS-C-2024",
      standard: {
        connect: { id: standardTwo.id },
      },
      academicYear: {
        connect: { id: year2024_1.id },
      },
      start_date: new Date("2024-09-01"),
      end_date: new Date("2025-06-20"),
    },
  });

  const classD = await prisma.class.create({
    data: {
      name: "Class D",
      access_code: "CLASS-D-2024",
      standard: {
        connect: { id: standardThree.id },
      },
      academicYear: {
        connect: { id: year2024_2.id },
      },
      start_date: new Date("2024-09-01"),
      end_date: new Date("2025-06-20"),
    },
  });

  /**
   * 5. Classes for 2025
   *    - references Standard and AcademicYear
   */
  const classE = await prisma.class.create({
    data: {
      name: "Class E",
      access_code: "CLASS-E-2025",
      standard: {
        connect: { id: standardOne.id },
      },
      academicYear: {
        connect: { id: year2025_1.id },
      },
      start_date: new Date("2025-09-01"),
      end_date: new Date("2026-06-20"),
    },
  });

  const classF = await prisma.class.create({
    data: {
      name: "Class F",
      access_code: "CLASS-F-2025",
      standard: {
        connect: { id: standardTwo.id },
      },
      academicYear: {
        connect: { id: year2025_1.id },
      },
      start_date: new Date("2025-09-01"),
      end_date: new Date("2026-06-20"),
    },
  });

  /**
   * 6. Users
   */
  // Regular user
  const userJane = await prisma.user.create({
    data: {
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      password: "securepassword",
      country_code: "+1",
      phone_no: "1234567890",
      address_1: "123 Maple Street",
      postcode: "12345",
      state: "SomeState",
      city: "SomeCity",
      is_verified: false,
      role: "USER",
    },
  });

  // Admin user
  const userAdmin = await prisma.user.create({
    data: {
      first_name: "Admin",
      last_name: "User",
      email: "admin@example.com",
      password: "supersecurepassword",
      country_code: "+1",
      phone_no: "9876543210",
      address_1: "456 Oak Avenue",
      postcode: "54321",
      state: "OtherState",
      city: "OtherCity",
      is_verified: true,
      role: "ADMIN",
    },
  });

  // Log the created userAdmin and classes
  console.log("Created Admin User:", userAdmin);
  console.log("Created Classes:", {
    classA,
    classB,
    classC,
    classD,
    classE,
    classF,
  });

  /**
   * 7. (Optional) Create a Verification record for Jane
   */
  await prisma.verification.create({
    data: {
      token: "some-random-token",
      token_expiry: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
      type: "EMAIL_VERIFICATION",
      user: {
        connect: { id: userJane.id },
      },
    },
  });

  console.log("Seeded database successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
