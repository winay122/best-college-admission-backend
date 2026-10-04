import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const email = args[0] || process.env.ADMIN_EMAIL || 'admin@bestcollegeadmission.in';
  const rawPassword = args[1] || process.env.ADMIN_PASSWORD || 'Admin@12345';
  const roleInput = args[2] ? args[2].toUpperCase() : 'ADMIN';

  if (!email || !rawPassword) {
    console.error('❌ Error: Email and password are required.');
    console.log('Usage: npx tsx scripts/create-admin.ts <email> <password> [ADMIN|STAFF]');
    process.exit(1);
  }

  const role: Role = roleInput === 'STAFF' ? Role.STAFF : Role.ADMIN;

  console.log(`⏳ Processing user creation/update for: ${email}...`);

  // Hash password using bcrypt
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: role
      }
    });
    console.log(`✅ Admin user updated successfully!`);
    console.log(`   ID: ${updatedUser.id}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
  } else {
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role
      }
    });
    console.log(`✅ Admin user created successfully!`);
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Role: ${newUser.role}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
