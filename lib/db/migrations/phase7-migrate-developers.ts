/**
 * Migration Script: Assign Developer Roles to Existing Developers
 * 
 * Phase 7 - Data Migration Strategy
 * 
 * Purpose:
 * - Update existing developers (role = DEVELOPER) with developer_role_id
 * - Default strategy: Assign all to Backend Developer (BE) if not specified
 * - Can be customized with mapping logic based on user attributes
 * 
 * Usage:
 * - Can be run via npm script or directly via tsx
 * - Supports dry-run mode for testing
 * - Provides detailed logging of changes
 */

import { db } from '../index';
import { users, developerRoles } from '../schema';
import { eq, and, isNull } from 'drizzle-orm';

// ============================================================================
// Configuration
// ============================================================================

interface MigrationConfig {
  dryRun: boolean;
  defaultDeveloperRoleCode: string;
  batchSize: number;
  logLevel: 'verbose' | 'normal' | 'quiet';
}

const DEFAULT_CONFIG: MigrationConfig = {
  dryRun: false,
  defaultDeveloperRoleCode: 'BE', // Backend Developer as default
  batchSize: 50,
  logLevel: 'normal',
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
// Migration Logic
// ============================================================================

/**
 * Custom mapping logic for assigning developer roles
 * Can be customized based on user attributes (name, email, unit, etc.)
 * 
 * @param user - User object
 * @returns Developer role code or null (will use default)
 */
function determineDeveloperRole(user: any): string | null {
  // Example custom logic (commented out):
  
  // Check email domain
  // if (user.email.includes('backend')) return 'BE';
  // if (user.email.includes('frontend')) return 'FE';
  // if (user.email.includes('qa')) return 'QA';
  
  // Check name patterns
  // const name = user.name.toLowerCase();
  // if (name.includes('backend') || name.includes('be')) return 'BE';
  // if (name.includes('frontend') || name.includes('fe')) return 'FE';
  
  // Return null to use default role
  return null;
}

/**
 * Main migration function
 */
export async function migrateDevelopers(
  config: Partial<MigrationConfig> = {}
): Promise<{
  success: boolean;
  totalProcessed: number;
  totalUpdated: number;
  errors: string[];
}> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const logger = new MigrationLogger(finalConfig);
  
  logger.log('='.repeat(60));
  logger.log('SIPPA Phase 7 Migration: Assign Developer Roles');
  logger.log('='.repeat(60));
  
  if (finalConfig.dryRun) {
    logger.warn('DRY RUN MODE - No changes will be committed to database');
  }
  
  const results = {
    success: true,
    totalProcessed: 0,
    totalUpdated: 0,
    errors: [] as string[],
  };
  
  try {
    // Step 1: Get default developer role
    logger.log('Step 1: Fetching default developer role...');
    const defaultRole = await db.query.developerRoles.findFirst({
      where: eq(developerRoles.code, finalConfig.defaultDeveloperRoleCode),
    });
    
    if (!defaultRole) {
      throw new Error(
        `Default developer role '${finalConfig.defaultDeveloperRoleCode}' not found in database. ` +
        `Please ensure developer_roles table is seeded.`
      );
    }
    
    logger.success(`Default role: ${defaultRole.name} (${defaultRole.code})`);
    
    // Step 2: Get all developer role mappings
    logger.log('Step 2: Loading all developer roles...');
    const allRoles = await db.query.developerRoles.findMany({
      where: eq(developerRoles.isActive, true),
    });
    
    const roleMap = new Map(allRoles.map(r => [r.code, r]));
    logger.verbose(`Loaded ${allRoles.length} active developer roles`);
    
    // Step 3: Find developers without developer_role_id
    logger.log('Step 3: Finding developers needing role assignment...');
    
    // Get DEVELOPER role ID
    const developerRole = await db.query.roles.findFirst({
      where: eq(developerRoles.code, 'DEVELOPER'),
    });
    
    if (!developerRole) {
      throw new Error('DEVELOPER role not found in roles table');
    }
    
    const developersToUpdate = await db.query.users.findMany({
      where: and(
        eq(users.roleId, developerRole.id),
        isNull(users.developerRoleId)
      ),
    });
    
    results.totalProcessed = developersToUpdate.length;
    
    if (developersToUpdate.length === 0) {
      logger.success('No developers need role assignment - migration already complete!');
      return results;
    }
    
    logger.log(`Found ${developersToUpdate.length} developers needing role assignment`);
    
    // Step 4: Process each developer
    logger.log('Step 4: Assigning developer roles...');
    
    for (const user of developersToUpdate) {
      try {
        // Determine role for this user
        const customRole = determineDeveloperRole(user);
        const roleCode = customRole || finalConfig.defaultDeveloperRoleCode;
        const role = roleMap.get(roleCode);
        
        if (!role) {
          const errorMsg = `Role '${roleCode}' not found for user ${user.id} (${user.email})`;
          logger.error(errorMsg);
          results.errors.push(errorMsg);
          continue;
        }
        
        logger.verbose(
          `User ${user.id} (${user.name}) → ${role.name} (${role.code})`
        );
        
        // Update user with developer_role_id
        if (!finalConfig.dryRun) {
          await db
            .update(users)
            .set({ developerRoleId: role.id })
            .where(eq(users.id, user.id));
        }
        
        results.totalUpdated++;
      } catch (error) {
        const errorMsg = `Error processing user ${user.id}: ${error}`;
        logger.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }
    
    // Step 5: Summary
    logger.log('='.repeat(60));
    logger.log('Migration Summary:');
    logger.log(`  Total developers processed: ${results.totalProcessed}`);
    logger.log(`  Total developers updated: ${results.totalUpdated}`);
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
// CLI Execution
// ============================================================================

/**
 * Run migration from command line
 * Usage: tsx lib/db/migrations/phase7-migrate-developers.ts [--dry-run] [--verbose]
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');
  
  migrateDevelopers({
    dryRun,
    logLevel: verbose ? 'verbose' : 'normal',
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
export default migrateDevelopers;
