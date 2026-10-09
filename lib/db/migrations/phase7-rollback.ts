/**
 * Rollback Script for Phase 7 Migration
 * 
 * Phase 7 - Data Migration Strategy
 * 
 * Purpose:
 * - Safely rollback Phase 7 migrations if issues arise
 * - Clear migrated data while preserving original tables
 * - Provide detailed logging and confirmation prompts
 * 
 * WARNING: This script will DELETE data. Use with caution!
 * 
 * Usage:
 * - Must be run with explicit confirmation
 * - Supports dry-run mode for testing
 * - Backs up data before deletion (optional)
 */

import { db } from '../index';
import { requestTeamAssignments, requestApplications, users, requests } from '../schema';
import { isNull, isNotNull } from 'drizzle-orm';
import * as readline from 'readline';

// ============================================================================
// Configuration
// ============================================================================

interface RollbackConfig {
  dryRun: boolean;
  requireConfirmation: boolean;
  backupBeforeRollback: boolean;
  logLevel: 'verbose' | 'normal' | 'quiet';
}

const DEFAULT_CONFIG: RollbackConfig = {
  dryRun: false,
  requireConfirmation: true,
  backupBeforeRollback: true,
  logLevel: 'normal',
};

// ============================================================================
// Logging Utilities
// ============================================================================

class RollbackLogger {
  private config: RollbackConfig;
  
  constructor(config: RollbackConfig) {
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
  
  danger(message: string) {
    console.error(`[DANGER] ⚠️  ${message}`);
  }
}

// ============================================================================
// Confirmation Utilities
// ============================================================================

/**
 * Prompt user for confirmation
 */
async function promptConfirmation(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

// ============================================================================
// Backup Functions
// ============================================================================

/**
 * Create backup of migrated data before rollback
 */
async function backupMigratedData(logger: RollbackLogger): Promise<boolean> {
  try {
    logger.log('Creating backup of migrated data...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPrefix = `sippa_backup_${timestamp}`;
    
    // Backup request_team_assignments
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ${backupPrefix}_request_team_assignments
      AS SELECT * FROM request_team_assignments
    `);
    logger.verbose(`  ✓ Backed up request_team_assignments`);
    
    // Backup request_applications
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ${backupPrefix}_request_applications
      AS SELECT * FROM request_applications
    `);
    logger.verbose(`  ✓ Backed up request_applications`);
    
    // Backup users (only developer_role_id column)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ${backupPrefix}_users_developer_roles
      AS SELECT id, developer_role_id FROM users WHERE developer_role_id IS NOT NULL
    `);
    logger.verbose(`  ✓ Backed up user developer roles`);
    
    // Backup requests (only application_id and requested_version)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ${backupPrefix}_requests_applications
      AS SELECT id, application_id, requested_version FROM requests WHERE application_id IS NOT NULL
    `);
    logger.verbose(`  ✓ Backed up request applications`);
    
    logger.success(`Backup created with prefix: ${backupPrefix}`);
    logger.log(`To restore backup, run: SELECT * FROM ${backupPrefix}_*`);
    
    return true;
  } catch (error) {
    logger.error(`Backup failed: ${error}`);
    return false;
  }
}

// ============================================================================
// Rollback Functions
// ============================================================================

/**
 * Rollback individual assignments
 */
async function rollbackAssignments(
  logger: RollbackLogger,
  dryRun: boolean
): Promise<{ success: boolean; count: number }> {
  try {
    logger.log('Rolling back individual assignments...');
    
    const existingAssignments = await db.query.requestTeamAssignments.findMany();
    const count = existingAssignments.length;
    
    if (count === 0) {
      logger.log('  No assignments to rollback');
      return { success: true, count: 0 };
    }
    
    if (!dryRun) {
      await db.delete(requestTeamAssignments);
    }
    
    logger.success(`  ${dryRun ? 'Would delete' : 'Deleted'} ${count} assignments`);
    return { success: true, count };
  } catch (error) {
    logger.error(`Rollback assignments failed: ${error}`);
    return { success: false, count: 0 };
  }
}

/**
 * Rollback application master entries
 */
async function rollbackApplications(
  logger: RollbackLogger,
  dryRun: boolean
): Promise<{ success: boolean; count: number }> {
  try {
    logger.log('Rolling back application master entries...');
    
    const existingApps = await db.query.requestApplications.findMany();
    const count = existingApps.length;
    
    if (count === 0) {
      logger.log('  No applications to rollback');
      return { success: true, count: 0 };
    }
    
    if (!dryRun) {
      // First, clear application_id from requests
      await db
        .update(requests)
        .set({ applicationId: null, requestedVersion: null })
        .where(isNotNull(requests.applicationId));
      
      // Then delete applications
      await db.delete(requestApplications);
    }
    
    logger.success(`  ${dryRun ? 'Would delete' : 'Deleted'} ${count} applications`);
    logger.success(`  ${dryRun ? 'Would clear' : 'Cleared'} application_id from requests`);
    return { success: true, count };
  } catch (error) {
    logger.error(`Rollback applications failed: ${error}`);
    return { success: false, count: 0 };
  }
}

/**
 * Rollback developer roles
 */
async function rollbackDeveloperRoles(
  logger: RollbackLogger,
  dryRun: boolean
): Promise<{ success: boolean; count: number }> {
  try {
    logger.log('Rolling back developer role assignments...');
    
    const [result] = await db.execute(`
      SELECT COUNT(*) as count FROM users WHERE developer_role_id IS NOT NULL
    `);
    const count = (result as any[])[0]?.count || 0;
    
    if (count === 0) {
      logger.log('  No developer roles to rollback');
      return { success: true, count: 0 };
    }
    
    if (!dryRun) {
      await db
        .update(users)
        .set({ developerRoleId: null })
        .where(isNotNull(users.developerRoleId));
    }
    
    logger.success(`  ${dryRun ? 'Would clear' : 'Cleared'} developer_role_id from ${count} users`);
    return { success: true, count };
  } catch (error) {
    logger.error(`Rollback developer roles failed: ${error}`);
    return { success: false, count: 0 };
  }
}

// ============================================================================
// Main Rollback Function
// ============================================================================

/**
 * Main rollback function
 */
export async function rollbackMigration(
  config: Partial<RollbackConfig> = {}
): Promise<{
  success: boolean;
  rolledBack: {
    assignments: number;
    applications: number;
    developerRoles: number;
  };
  errors: string[];
}> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const logger = new RollbackLogger(finalConfig);
  
  logger.danger('='.repeat(60));
  logger.danger('SIPPA Phase 7 Migration ROLLBACK');
  logger.danger('='.repeat(60));
  logger.danger('WARNING: This will DELETE migrated data!');
  logger.danger('='.repeat(60));
  
  if (finalConfig.dryRun) {
    logger.warn('DRY RUN MODE - No changes will be committed to database');
  }
  
  const results = {
    success: true,
    rolledBack: {
      assignments: 0,
      applications: 0,
      developerRoles: 0,
    },
    errors: [] as string[],
  };
  
  try {
    // Confirmation prompt
    if (finalConfig.requireConfirmation && !finalConfig.dryRun) {
      logger.warn('This action will:');
      logger.warn('  1. Delete all entries in request_team_assignments');
      logger.warn('  2. Delete all entries in request_applications');
      logger.warn('  3. Clear developer_role_id from all users');
      logger.warn('  4. Clear application_id from all requests');
      logger.warn('');
      
      const confirmed = await promptConfirmation('Are you sure you want to proceed?');
      
      if (!confirmed) {
        logger.log('Rollback cancelled by user');
        return results;
      }
      
      // Double confirmation for production
      const doubleConfirm = await promptConfirmation(
        'Type "yes" again to confirm this destructive action'
      );
      
      if (!doubleConfirm) {
        logger.log('Rollback cancelled by user');
        return results;
      }
    }
    
    // Create backup if requested
    if (finalConfig.backupBeforeRollback && !finalConfig.dryRun) {
      const backupSuccess = await backupMigratedData(logger);
      if (!backupSuccess) {
        logger.error('Backup failed - aborting rollback for safety');
        results.success = false;
        results.errors.push('Backup creation failed');
        return results;
      }
    }
    
    logger.log('\nStarting rollback...\n');
    
    // Step 1: Rollback assignments
    const assignmentResult = await rollbackAssignments(logger, finalConfig.dryRun);
    results.rolledBack.assignments = assignmentResult.count;
    if (!assignmentResult.success) {
      results.errors.push('Assignment rollback failed');
    }
    
    // Step 2: Rollback applications
    const applicationResult = await rollbackApplications(logger, finalConfig.dryRun);
    results.rolledBack.applications = applicationResult.count;
    if (!applicationResult.success) {
      results.errors.push('Application rollback failed');
    }
    
    // Step 3: Rollback developer roles
    const roleResult = await rollbackDeveloperRoles(logger, finalConfig.dryRun);
    results.rolledBack.developerRoles = roleResult.count;
    if (!roleResult.success) {
      results.errors.push('Developer role rollback failed');
    }
    
    // Summary
    logger.log('\n' + '='.repeat(60));
    logger.log('Rollback Summary:');
    logger.log(`  Assignments rolled back: ${results.rolledBack.assignments}`);
    logger.log(`  Applications rolled back: ${results.rolledBack.applications}`);
    logger.log(`  Developer roles rolled back: ${results.rolledBack.developerRoles}`);
    logger.log(`  Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      logger.warn('Errors encountered:');
      results.errors.forEach((err, idx) => {
        logger.warn(`  ${idx + 1}. ${err}`);
      });
      results.success = false;
    }
    
    if (finalConfig.dryRun) {
      logger.warn('DRY RUN MODE - No changes were committed');
    } else {
      if (results.success) {
        logger.success('Rollback completed successfully!');
        logger.log('\nNext steps:');
        logger.log('  1. Verify that old tables (teams, team_members, request_assignments) are intact');
        logger.log('  2. Re-run Phase 7 migration scripts if needed');
        logger.log('  3. Test application functionality');
      } else {
        logger.error('Rollback completed with errors - manual intervention may be needed');
      }
    }
    
    logger.log('='.repeat(60));
    
  } catch (error) {
    logger.error(`Fatal error during rollback: ${error}`);
    results.success = false;
    results.errors.push(String(error));
  }
  
  return results;
}

// ============================================================================
// CLI Execution
// ============================================================================

/**
 * Run rollback from command line
 * Usage: tsx lib/db/migrations/phase7-rollback.ts [--dry-run] [--no-confirm] [--no-backup]
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const noConfirm = args.includes('--no-confirm');
  const noBackup = args.includes('--no-backup');
  
  rollbackMigration({
    dryRun,
    requireConfirmation: !noConfirm,
    backupBeforeRollback: !noBackup,
    logLevel: 'normal',
  })
    .then((results) => {
      process.exit(results.success && results.errors.length === 0 ? 0 : 1);
    })
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

// Export for programmatic use
export default rollbackMigration;
