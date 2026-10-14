/**
 * Migration Script: Convert Team Assignments to Individual Assignments
 * 
 * Phase 7 - Data Migration Strategy
 * 
 * Purpose:
 * - Migrate from old team-based assignments (teams + team_members) 
 * - To new individual-based assignments (request_team_assignments)
 * - Preserve assignment history and metadata
 * - Handle developer role assignment in the process
 * 
 * Usage:
 * - Can be run via npm script or directly via tsx
 * - Supports dry-run mode for testing
 * - Provides detailed logging of changes
 * 
 * Note: This script assumes old tables (teams, team_members, request_assignments)
 * still exist in the database. They should be kept until migration is complete.
 */

import { db } from '../index';
import { requestTeamAssignments, users } from '../schema';
import { eq, sql } from 'drizzle-orm';

// ============================================================================
// Configuration
// ============================================================================

interface MigrationConfig {
  dryRun: boolean;
  batchSize: number;
  logLevel: 'verbose' | 'normal' | 'quiet';
  skipIfExists: boolean; // Skip if request_team_assignments already has data
}

const DEFAULT_CONFIG: MigrationConfig = {
  dryRun: false,
  batchSize: 100,
  logLevel: 'normal',
  skipIfExists: true,
};

// ============================================================================
// Logging Utilities
// ============================================================================

class MigrationLogger {
  private config: MigrationConfig;
  
  constructor(config: MigrationConfig) {
    this.config = config;
  }
  
  log(message: string) {
    if (this.config.logLevel !== 'quiet') {
      console.log(`[INFO] ${message}`);
    }
  }
  
  verbose(message: string) {
    if (this.config.logLevel === 'verbose') {
      console.log(`[VERBOSE] ${message}`);
    }
  }
  
  warn(message: string) {
    console.warn(`[WARN] ${message}`);
  }
  
  error(message: string) {
    console.error(`[ERROR] ${message}`);
  }
  
  success(message: string) {
    console.log(`[SUCCESS] ✓ ${message}`);
  }
}

// ============================================================================
// Old Schema Interfaces (for reference)
// ============================================================================

interface OldTeam {
  id: number;
  name: string;
  created_at: Date;
}

interface OldTeamMember {
  id: number;
  team_id: number;
  user_id: number;
  role: string | null;
  joined_at: Date;
}

interface OldRequestAssignment {
  id: number;
  request_id: number;
  team_id: number;
  assigned_by: number;
  assigned_at: Date;
  notes: string | null;
}

// ============================================================================
// Migration Logic
// ============================================================================

/**
 * Check if old tables exist in database
 */
async function checkOldTablesExist(): Promise<{
  teamsExists: boolean;
  teamMembersExists: boolean;
  requestAssignmentsExists: boolean;
}> {
  try {
    const [tables] = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      AND table_name IN ('teams', 'team_members', 'request_assignments')
    `) as unknown as [any[], any];
    
    const tableNames = tables.map(t => t.table_name || t.TABLE_NAME);
    
    return {
      teamsExists: tableNames.includes('teams'),
      teamMembersExists: tableNames.includes('team_members'),
      requestAssignmentsExists: tableNames.includes('request_assignments'),
    };
  } catch (error) {
    return {
      teamsExists: false,
      teamMembersExists: false,
      requestAssignmentsExists: false,
    };
  }
}

/**
 * Main migration function
 */
export async function migrateAssignments(
  config: Partial<MigrationConfig> = {}
): Promise<{
  success: boolean;
  totalProcessed: number;
  totalCreated: number;
  errors: string[];
}> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const logger = new MigrationLogger(finalConfig);
  
  logger.log('='.repeat(60));
  logger.log('SIPPA Phase 7 Migration: Convert Team to Individual Assignments');
  logger.log('='.repeat(60));
  
  if (finalConfig.dryRun) {
    logger.warn('DRY RUN MODE - No changes will be committed to database');
  }
  
  const results = {
    success: true,
    totalProcessed: 0,
    totalCreated: 0,
    errors: [] as string[],
  };
  
  try {
    // Step 1: Check if old tables exist
    logger.log('Step 1: Checking for old table structure...');
    
    const tableCheck = await checkOldTablesExist();
    
    if (!tableCheck.teamsExists || !tableCheck.teamMembersExists || !tableCheck.requestAssignmentsExists) {
      logger.warn('Old tables (teams, team_members, request_assignments) not found.');
      logger.warn('This migration assumes you are upgrading from a system with team-based assignments.');
      logger.warn('If you are starting fresh or have already migrated, you can skip this step.');
      
      if (!tableCheck.teamsExists) logger.verbose('  - teams table: NOT FOUND');
      if (!tableCheck.teamMembersExists) logger.verbose('  - team_members table: NOT FOUND');
      if (!tableCheck.requestAssignmentsExists) logger.verbose('  - request_assignments table: NOT FOUND');
      
      logger.success('Migration skipped - old structure not present');
      return results;
    }
    
    logger.success('Old tables found - proceeding with migration');
    
    // Step 2: Check if new table already has data
    if (finalConfig.skipIfExists) {
      logger.log('Step 2: Checking if migration already complete...');
      
      const existingAssignments = await db.query.requestTeamAssignments.findMany({
        limit: 1,
      });
      
      if (existingAssignments.length > 0) {
        logger.success('Migration already complete - request_team_assignments has data');
        return results;
      }
    }
    
    // Step 3: Load all old assignments
    logger.log('Step 3: Loading old request assignments...');
    
    const [oldAssignments] = await db.execute(`
      SELECT id, request_id, team_id, assigned_by, assigned_at, notes
      FROM request_assignments
      ORDER BY assigned_at ASC
    `) as unknown as [OldRequestAssignment[], any];
    
    const assignments = oldAssignments;
    results.totalProcessed = assignments.length;
    
    if (assignments.length === 0) {
      logger.success('No old assignments found - migration complete');
      return results;
    }
    
    logger.log(`Found ${assignments.length} old team assignments to migrate`);
    
    // Step 4: Process each assignment
    logger.log('Step 4: Converting team assignments to individual assignments...');
    
    for (const assignment of assignments) {
      try {
        // Get team members for this team
        const [teamMembers] = await db.execute(sql`
          SELECT tm.user_id, tm.role, u.developer_role_id
          FROM team_members tm
          JOIN users u ON u.id = tm.user_id
          WHERE tm.team_id = ${assignment.team_id}
        `) as unknown as [any[], any];
        
        const members = teamMembers;
        
        if (members.length === 0) {
          logger.warn(`Team ${assignment.team_id} has no members - skipping`);
          continue;
        }
        
        logger.verbose(
          `Request ${assignment.request_id}: Converting ${members.length} team members to individual assignments`
        );
        
        // Create individual assignments for each team member
        for (const member of members) {
          if (!finalConfig.dryRun) {
            await db.insert(requestTeamAssignments).values({
              requestId: assignment.request_id,
              assignedUserId: member.user_id,
              developerRoleId: member.developer_role_id || null,
              assignedBy: assignment.assigned_by,
              assignedAt: assignment.assigned_at,
              unassignedAt: null,
              notes: assignment.notes,
              createdAt: assignment.assigned_at,
              updatedAt: assignment.assigned_at,
            });
            
            results.totalCreated++;
          } else {
            results.totalCreated++;
          }
        }
        
      } catch (error) {
        const errorMsg = `Error processing assignment ${assignment.id}: ${error}`;
        logger.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }
    
    // Step 5: Summary
    logger.log('='.repeat(60));
    logger.log('Migration Summary:');
    logger.log(`  Old team assignments processed: ${results.totalProcessed}`);
    logger.log(`  New individual assignments created: ${results.totalCreated}`);
    logger.log(`  Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      logger.warn('Errors encountered:');
      results.errors.forEach((err, idx) => {
        logger.warn(`  ${idx + 1}. ${err}`);
      });
    }
    
    if (finalConfig.dryRun) {
      logger.warn('DRY RUN MODE - No changes were committed');
    } else {
      logger.success('Migration completed successfully!');
      logger.log('\nNext steps:');
      logger.log('  1. Verify data in request_team_assignments table');
      logger.log('  2. Test application functionality with new structure');
      logger.log('  3. Once verified, old tables can be dropped:');
      logger.log('     - DROP TABLE request_assignments;');
      logger.log('     - DROP TABLE team_members;');
      logger.log('     - DROP TABLE teams;');
    }
    
    logger.log('='.repeat(60));
    
  } catch (error) {
    logger.error(`Fatal error during migration: ${error}`);
    results.success = false;
    results.errors.push(String(error));
  }
  
  return results;
}

// ============================================================================
// Verification Functions
// ============================================================================

/**
 * Verify migration results
 * Compare counts and data integrity
 */
export async function verifyMigration(): Promise<{
  success: boolean;
  checks: Array<{ name: string; passed: boolean; message: string }>;
}> {
  const logger = new MigrationLogger({ ...DEFAULT_CONFIG, logLevel: 'normal' });
  
  logger.log('='.repeat(60));
  logger.log('Verifying Migration Results');
  logger.log('='.repeat(60));
  
  const checks: Array<{ name: string; passed: boolean; message: string }> = [];
  
  try {
    // Check 1: New assignments exist
    const newAssignments = await db.query.requestTeamAssignments.findMany();
    const check1 = {
      name: 'New assignments created',
      passed: newAssignments.length > 0,
      message: `Found ${newAssignments.length} individual assignments`,
    };
    checks.push(check1);
    logger.log(`✓ ${check1.message}`);
    
    // Check 2: All users have developer_role_id
    const [developersWithoutRole] = await db.execute(`
      SELECT COUNT(*) as count
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE r.code = 'DEVELOPER'
      AND u.developer_role_id IS NULL
    `) as unknown as [any[], any];
    
    const count = developersWithoutRole[0]?.count || 0;
    const check2 = {
      name: 'All developers have roles',
      passed: count === 0,
      message: count === 0 
        ? 'All developers have developer_role_id assigned' 
        : `${count} developers still missing developer_role_id`,
    };
    checks.push(check2);
    logger.log(`${check2.passed ? '✓' : '✗'} ${check2.message}`);
    
    // Check 3: All approved NEW_APPLICATION have application_id
    const [appsWithoutId] = await db.execute(`
      SELECT COUNT(*) as count
      FROM requests
      WHERE request_type = 'NEW_APPLICATION'
      AND status IN ('APPROVED', 'IN_PROGRESS', 'COMPLETED')
      AND application_id IS NULL
    `) as unknown as [any[], any];
    
    const appCount = appsWithoutId[0]?.count || 0;
    const check3 = {
      name: 'NEW_APPLICATION requests linked',
      passed: appCount === 0,
      message: appCount === 0
        ? 'All approved NEW_APPLICATION requests have application_id'
        : `${appCount} NEW_APPLICATION requests still missing application_id`,
    };
    checks.push(check3);
    logger.log(`${check3.passed ? '✓' : '✗'} ${check3.message}`);
    
    // Overall result
    const allPassed = checks.every(c => c.passed);
    
    logger.log('='.repeat(60));
    if (allPassed) {
      logger.success('All verification checks passed!');
    } else {
      logger.warn('Some verification checks failed - review required');
    }
    logger.log('='.repeat(60));
    
    return {
      success: allPassed,
      checks,
    };
    
  } catch (error) {
    logger.error(`Verification failed: ${error}`);
    return {
      success: false,
      checks,
    };
  }
}

// ============================================================================
// CLI Execution
// ============================================================================

/**
 * Run migration from command line
 * Usage: tsx lib/db/migrations/phase7-migrate-assignments.ts [--dry-run] [--verbose] [--verify]
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');
  const verify = args.includes('--verify');
  
  const config = {
    dryRun,
    logLevel: verbose ? 'verbose' as const : 'normal' as const,
  };
  
  (async () => {
    if (verify) {
      // Run verification only
      const verifyResults = await verifyMigration();
      process.exit(verifyResults.success ? 0 : 1);
    } else {
      // Run migration
      const results = await migrateAssignments(config);
      process.exit(results.success && results.errors.length === 0 ? 0 : 1);
    }
  })().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

// Export for programmatic use
export default migrateAssignments;

