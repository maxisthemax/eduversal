import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import toUpper from "lodash/toUpper";
import { v4 as uuidv4 } from "uuid";

async function main() {
  /**
   * 6. Users
   */
  const saltRounds = 10;

  // Regular user
  const hashedPasswordJane = await bcrypt.hash("securepassword", saltRounds);
  const userJane = await prisma.user.create({
    data: {
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      password: hashedPasswordJane,
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
  const hashedPasswordAdmin = await bcrypt.hash("12345678A", saltRounds);
  const userAdmin = await prisma.user.create({
    data: {
      first_name: "Admin",
      last_name: "User",
      email: "admin@admin.com",
      password: hashedPasswordAdmin,
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

  /**
   * 1. Institution Types
   */
  const preschool = await prisma.institutionType.create({
    data: {
      name: "Preschool",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  const primary = await prisma.institutionType.create({
    data: {
      name: "Primary School",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
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
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  const institutionB = await prisma.institution.create({
    data: {
      name: "Sekolah Menengah Kebangsaan Damansara Utama",
      code: "SMKDU",
      type: {
        connect: { id: primary.id },
      },
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
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
      year: 2024,
      start_date: new Date("2024-01-01"),
      end_date: new Date("2024-12-31"),
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  const year2025_1 = await prisma.academicYear.create({
    data: {
      name: "2025",
      institution: {
        connect: { id: institutionA.id },
      },
      start_date: new Date("2025-01-01"),
      end_date: new Date("2025-12-31"),
      year: 2025,
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  const year2024_2 = await prisma.academicYear.create({
    data: {
      name: "2024",
      institution: {
        connect: { id: institutionB.id },
      },
      start_date: new Date("2024-01-01"),
      end_date: new Date("2024-12-31"),
      year: 2024,
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  /**
   * 4. Standards
   */
  const standardOne = await prisma.standard.create({
    data: {
      name: "Standard 1",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  const standardTwo = await prisma.standard.create({
    data: {
      name: "Standard 2",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  const standardThree = await prisma.standard.create({
    data: {
      name: "Standard 3",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  /**
   * 5. Courses for 2024
   *    - references Standard and AcademicYear
   */
  const generateAccessCode = (
    institutionCode: string,
    academicYear: string,
    runningNumber: string
  ) => {
    return `${institutionCode}${academicYear}${toUpper(runningNumber)}`;
  };

  const courseA = await prisma.course.create({
    data: {
      name: "Course A",
      access_code: generateAccessCode(
        institutionA.code,
        year2024_1.year.toString(),
        uuidv4().slice(0, 4)
      ),
      standard: {
        connect: { id: standardOne.id },
      },
      academicYear: {
        connect: { id: year2024_1.id },
      },
      institution: {
        connect: { id: institutionA.id },
      },
      start_date: new Date("2025-01-01"),
      end_date: new Date("2025-12-31"),
      valid_period: "YEAR",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  const courseB = await prisma.course.create({
    data: {
      name: "Course B",
      access_code: generateAccessCode(
        institutionB.code,
        year2024_2.year.toString(),
        uuidv4().slice(0, 4)
      ),
      standard: {
        connect: { id: standardOne.id },
      },
      academicYear: {
        connect: { id: year2024_2.id },
      },
      institution: {
        connect: { id: institutionB.id },
      },
      start_date: new Date("2025-01-01"),
      end_date: new Date("2025-12-31"),
      valid_period: "YEAR",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  const courseC = await prisma.course.create({
    data: {
      name: "Course C",
      access_code: generateAccessCode(
        institutionA.code,
        year2024_1.year.toString(),
        uuidv4().slice(0, 4)
      ),
      standard: {
        connect: { id: standardTwo.id },
      },
      academicYear: {
        connect: { id: year2024_1.id },
      },
      institution: {
        connect: { id: institutionA.id },
      },
      start_date: new Date("2025-01-01"),
      end_date: new Date("2025-12-31"),
      valid_period: "YEAR",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  const courseD = await prisma.course.create({
    data: {
      name: "Course D",
      access_code: generateAccessCode(
        institutionB.code,
        year2024_2.year.toString(),
        uuidv4().slice(0, 4)
      ),
      standard: {
        connect: { id: standardThree.id },
      },
      academicYear: {
        connect: { id: year2024_2.id },
      },
      institution: {
        connect: { id: institutionB.id },
      },
      start_date: new Date("2025-01-01"),
      end_date: new Date("2025-12-31"),
      valid_period: "YEAR",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  /**
   * 5. Courses for 2025
   *    - references Standard and AcademicYear
   */
  const courseE = await prisma.course.create({
    data: {
      name: "Course E",
      access_code: generateAccessCode(
        institutionA.code,
        year2025_1.year.toString(),
        uuidv4().slice(0, 4)
      ),
      standard: {
        connect: { id: standardOne.id },
      },
      academicYear: {
        connect: { id: year2025_1.id },
      },
      institution: {
        connect: { id: institutionA.id },
      },
      start_date: new Date("2025-01-01"),
      end_date: new Date("2025-12-31"),
      valid_period: "YEAR",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  const courseF = await prisma.course.create({
    data: {
      name: "Course F",
      access_code: generateAccessCode(
        institutionA.code,
        year2025_1.year.toString(),
        uuidv4().slice(0, 4)
      ),
      standard: {
        connect: { id: standardTwo.id },
      },
      academicYear: {
        connect: { id: year2025_1.id },
      },
      institution: {
        connect: { id: institutionA.id },
      },
      start_date: new Date("2025-01-01"),
      end_date: new Date("2025-12-31"),
      valid_period: "YEAR",
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  // Log the created userAdmin and courses
  console.log("Created Admin User:", userAdmin);
  console.log("Created Courses:", {
    courseA,
    courseB,
    courseC,
    courseD,
    courseE,
    courseF,
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

  /**
   * 8. Albums
   */
  const album1 = await prisma.album.create({
    data: {
      name: "Summer Vacation",
      description: "Photos from our summer vacation.",
      type: "INDIVIDUAL",
      institution_id: institutionA.id,
      course_id: courseA.id,
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  const album2 = await prisma.album.create({
    data: {
      name: "Winter Wonderland",
      description: "Photos from our winter trip.",
      type: "GROUP",
      institution_id: institutionB.id,
      course_id: courseB.id,
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  /**
   * 9. Photos
   */
  const photo1 = await prisma.photo.create({
    data: {
      name: "Beach",
      download_url:
        "https://plus.unsplash.com/premium_photo-1670137142833-7e7ddd459501?q=80&w=1901&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      display_url:
        "https://static.imgix.net/lorie.png?h=480&w=320&mark64=aHR0cHM6Ly9hc3NldHMuaW1naXgubmV0L3ByZXNza2l0L2ltZ2l4LXByZXNza2l0LnBkZj9mbT1wbmcmcGFnZT00",
      album_id: album1.id,
      institution_id: institutionA.id,
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  const photo2 = await prisma.photo.create({
    data: {
      name: "Snowy Mountains",
      download_url:
        "https://plus.unsplash.com/premium_photo-1670137142833-7e7ddd459501?q=80&w=1901&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      display_url:
        "https://static.imgix.net/lorie.png?h=480&w=320&mark64=aHR0cHM6Ly9hc3NldHMuaW1naXgubmV0L3ByZXNza2l0L2ltZ2l4LXByZXNza2l0LnBkZj9mbT1wbmcmcGFnZT00",
      album_id: album2.id,
      institution_id: institutionB.id,
      created_by_user_id: userAdmin.id,
      updated_by_user_id: userAdmin.id,
      created_by_name: userAdmin.first_name + " " + userAdmin.last_name,
      updated_by_name: userAdmin.first_name + " " + userAdmin.last_name,
    },
  });

  // Log the created albums and photos
  console.log("Created Albums:", { album1, album2 });
  console.log("Created Photos:", { photo1, photo2 });

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
