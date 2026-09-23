import { config } from 'dotenv';
import { db } from './index';
import { roles, priorities, units, teams, users } from './schema';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function seed() {
  console.log('🌱 Seeding database...');

  // Seed Roles
  console.log('  → Seeding roles...');
  await db.insert(roles).values([
    { id: 1, code: 'user', name: 'User', description: 'Regular user who submits requests' },
    { id: 2, code: 'admin', name: 'Admin', description: 'Administrator who manages requests' },
    { id: 3, code: 'developer', name: 'Developer', description: 'Developer who works on requests' },
  ]).onDuplicateKeyUpdate({ set: { code: 'user' } });

  // Seed Priorities
  console.log('  → Seeding priorities...');
  await db.insert(priorities).values([
    { id: 1, code: 'low', name: 'Low', sortOrder: 1 },
    { id: 2, code: 'medium', name: 'Medium', sortOrder: 2 },
    { id: 3, code: 'high', name: 'High', sortOrder: 3 },
    { id: 4, code: 'critical', name: 'Critical', sortOrder: 4 },
  ]).onDuplicateKeyUpdate({ set: { code: 'low' } });

  // Seed Units
  console.log('  → Seeding units...');
  await db.insert(units).values([
    { id: 1, code: 'IT', name: 'Information Technology' },
    { id: 2, code: 'FIN', name: 'Finance' },
    { id: 3, code: 'HR', name: 'Human Resources' },
    { id: 4, code: 'OPS', name: 'Operations' },
  ]).onDuplicateKeyUpdate({ set: { code: 'IT' } });

  // Seed Teams
  console.log('  → Seeding teams...');
  await db.insert(teams).values([
    { id: 1, code: 'DEVTI', name: 'Development Team IT' },
    { id: 2, code: 'INFRA', name: 'Infrastructure Team' },
  ]).onDuplicateKeyUpdate({ set: { code: 'DEVTI' } });

  // Seed Users
  console.log('  → Seeding users...');
  const defaultPassword = await bcrypt.hash('password123', 10);

  await db.insert(users).values([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@sippa.local',
      passwordHash: defaultPassword,
      roleId: 2, // admin
      unitId: 1,
      phone: '081234567890',
    },
    {
      id: 2,
      name: 'John Doe',
      email: 'user@sippa.local',
      passwordHash: defaultPassword,
      roleId: 1, // user
      unitId: 2,
      phone: '081234567891',
    },
    {
      id: 3,
      name: 'Developer One',
      email: 'dev@sippa.local',
      passwordHash: defaultPassword,
      roleId: 3, // developer
      unitId: 1,
      phone: '081234567892',
    },
  ]).onDuplicateKeyUpdate({ set: { email: 'admin@sippa.local' } });

  console.log('✅ Seeding completed!');
  console.log('');
  console.log('Test accounts:');
  console.log('  Admin: admin@sippa.local / password123');
  console.log('  User: user@sippa.local / password123');
  console.log('  Developer: dev@sippa.local / password123');
  console.log('');

  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
