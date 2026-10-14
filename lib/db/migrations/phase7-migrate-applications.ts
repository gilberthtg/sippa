/**
 * Migration Script: Create Application Master Entries from Existing Requests
 * 
 * Phase 7 - Data Migration Strategy
 * 
 * Purpose:
 * - Find approved NEW_APPLICATION requests without application_id
 * - Create entries in request_applications table
 * - Update requests with application_id reference
 * - Handle version management (default to 1.0.0 for NEW_APPLICATION)
 * 
 * Usage:
 * - Can be run via npm script or directly via tsx
 * - Supports dry-run mode for testing
 * - Provides detailed logging of changes
 */

import { db } from '../index';
import { requests, requestApplications } from '../schema';
import { eq, and, isNull, inArray } from 'drizzle-orm';
import { 
  generateUniqueApplicationName, 
  extractApplicationName, 
  sanitizeString 
} from '../../utils/migration';

// ============================================================================
// Configuration
// ============================================================================

interface MigrationConfig {
  dryRun: boolean;
  defaultVersion: string;
  batchSize: number;
  logLevel: 'verbose' | 'normal' | 'quiet';
}

const DEFAULT_CONFIG: MigrationConfig = {
  dryRun: false,
  defaultVersion: '1.0.0',
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

interface ApplicationCreationResult {
  requestId: number;
  applicationId: number | null;
  applicationName: string;
  error?: string;
}

/**
 * Main migration function
 */
export async function migrateApplications(
  config: Partial<MigrationConfig> = {}
): Promise<{
  success: boolean;
  totalProcessed: number;
  totalCreated: number;
  totalUpdated: number;
  errors: string[];
}> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const logger = new MigrationLogger(finalConfig);
  
  logger.log('='.repeat(60));
  logger.log('SIPPA Phase 7 Migration: Create Application Master Entries');
  logger.log('='.repeat(60));
  
  if (finalConfig.dryRun) {
    logger.warn('DRY RUN MODE - No changes will be committed to database');
  }
  
  const results = {
    success: true,
    totalProcessed: 0,
    totalCreated: 0,
    totalUpdated: 0,
    errors: [] as string[],
  };
  
  try {
    // Step 1: Find NEW_APPLICATION requests that need migration
    logger.log('Step 1: Finding NEW_APPLICATION requests needing migration...');
    
    const newAppRequests = await db.query.requests.findMany({
      where: and(
        eq(requests.requestType, 'new_application'),
        isNull(requests.applicationId),
        inArray(requests.status, ['approved', 'in_progress', 'completed'])
      ),
      orderBy: (requests, { asc }) => [asc(requests.submittedAt)],
    });
    
    results.totalProcessed = newAppRequests.length;
    
    if (newAppRequests.length === 0) {
      logger.success('No NEW_APPLICATION requests need migration!');
      return results;
    }
    
    logger.log(`Found ${newAppRequests.length} NEW_APPLICATION requests to migrate`);
    
    // Step 2: Get existing application names to ensure uniqueness
    logger.log('Step 2: Loading existing application names...');
    
    const existingApps = await db.query.requestApplications.findMany();
    const existingNames = existingApps.map(app => app.applicationName);
    
    logger.verbose(`Found ${existingNames.length} existing applications`);
    
    // Step 3: Process each request
    logger.log('Step 3: Creating application master entries...');
    
    const creationResults: ApplicationCreationResult[] = [];
    
    for (const request of newAppRequests) {
      try {
        // Extract and clean application name from title
        const rawName = request.title || `Application ${request.requestNo}`;
        const extractedName = extractApplicationName(rawName);
        
        // Ensure uniqueness
        const uniqueName = generateUniqueApplicationName(extractedName, [
          ...existingNames,
          ...creationResults.map(r => r.applicationName),
        ]);
        
        logger.verbose(
          `Request ${request.requestNo}: "${request.title}" → "${uniqueName}"`
        );
        
        let applicationId: number | null = null;
        
        if (!finalConfig.dryRun) {
          // Create application entry
          const [newApp] = await db
            .insert(requestApplications)
            .values({
              applicationName: uniqueName,
              description: sanitizeString(request.description),
              currentVersion: finalConfig.defaultVersion,
              createdBy: request.requesterId,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .$returningId();
          
          applicationId = newApp.id;
          
          // Update request with application_id
          await db
            .update(requests)
            .set({ 
              applicationId: applicationId,
              requestedVersion: finalConfig.defaultVersion, // Set for NEW_APPLICATION
            })
            .where(eq(requests.id, request.id));
          
          results.totalCreated++;
          results.totalUpdated++;
        }
        
        creationResults.push({
          requestId: request.id,
          applicationId,
          applicationName: uniqueName,
        });
        
      } catch (error) {
        const errorMsg = `Error processing request ${request.id} (${request.requestNo}): ${error}`;
        logger.error(errorMsg);
        results.errors.push(errorMsg);
        
        creationResults.push({
          requestId: request.id,
          applicationId: null,
          applicationName: '',
          error: String(error),
        });
      }
    }
    
    // Step 4: Display results
    logger.log('='.repeat(60));
    logger.log('Migration Summary:');
    logger.log(`  Total requests processed: ${results.totalProcessed}`);
    logger.log(`  Applications created: ${results.totalCreated}`);
    logger.log(`  Requests updated: ${results.totalUpdated}`);
    logger.log(`  Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      logger.warn('Errors encountered:');
      results.errors.forEach((err, idx) => {
        logger.warn(`  ${idx + 1}. ${err}`);
      });
    }
    
    // Display created applications
    if (finalConfig.logLevel === 'verbose' && creationResults.length > 0) {
      logger.log('\nCreated Applications:');
      creationResults
        .filter(r => !r.error)
        .forEach((result, idx) => {
          logger.verbose(
            `  ${idx + 1}. ${result.applicationName} (ID: ${result.applicationId || 'N/A'})`
          );
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
// Additional Migration: Link RFC Requests to Applications
// ============================================================================

/**
 * Link existing RFC requests to applications by matching title
 * This is a best-effort migration - manual review may be needed
 */
export async function linkRFCRequests(
  config: Partial<MigrationConfig> = {}
): Promise<{
  success: boolean;
  totalProcessed: number;
  totalLinked: number;
  totalUnmatched: number;
  errors: string[];
}> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const logger = new MigrationLogger(finalConfig);
  
  logger.log('='.repeat(60));
  logger.log('SIPPA Phase 7 Migration: Link RFC Requests to Applications');
  logger.log('='.repeat(60));
  
  if (finalConfig.dryRun) {
    logger.warn('DRY RUN MODE - No changes will be committed to database');
  }
  
  const results = {
    success: true,
    totalProcessed: 0,
    totalLinked: 0,
    totalUnmatched: 0,
    errors: [] as string[],
  };
  
  try {
    // Find RFC requests without application_id
    logger.log('Finding RFC requests needing application link...');
    
    const rfcRequests = await db.query.requests.findMany({
      where: and(
        eq(requests.requestType, 'rfc'),
        isNull(requests.applicationId)
      ),
    });
    
    results.totalProcessed = rfcRequests.length;
    
    if (rfcRequests.length === 0) {
      logger.success('No RFC requests need linking!');
      return results;
    }
    
    logger.log(`Found ${rfcRequests.length} RFC requests to link`);
    
    // Get all applications
    const applications = await db.query.requestApplications.findMany();
    
    logger.verbose(`Loaded ${applications.length} applications for matching`);
    
    // Try to match each RFC to an application
    for (const request of rfcRequests) {
      try {
        const requestTitle = extractApplicationName(request.title || '');
        
        // Find best match
        let bestMatch = null;
        let bestScore = 0;
        
        for (const app of applications) {
          const appName = app.applicationName.toLowerCase();
          const reqName = requestTitle.toLowerCase();
          
          // Simple matching: check if names contain each other
          if (appName.includes(reqName) || reqName.includes(appName)) {
            const score = Math.max(reqName.length, appName.length);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = app;
            }
          }
        }
        
        if (bestMatch) {
          logger.verbose(
            `RFC ${request.requestNo}: "${request.title}" → "${bestMatch.applicationName}"`
          );
          
          if (!finalConfig.dryRun) {
            await db
              .update(requests)
              .set({ applicationId: bestMatch.id })
              .where(eq(requests.id, request.id));
          }
          
          results.totalLinked++;
        } else {
          logger.warn(
            `RFC ${request.requestNo}: No match found for "${request.title}"`
          );
          results.totalUnmatched++;
        }
        
      } catch (error) {
        const errorMsg = `Error linking RFC ${request.id}: ${error}`;
        logger.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }
    
    // Summary
    logger.log('='.repeat(60));
    logger.log('RFC Linking Summary:');
    logger.log(`  Total RFC requests: ${results.totalProcessed}`);
    logger.log(`  Successfully linked: ${results.totalLinked}`);
    logger.log(`  Unmatched: ${results.totalUnmatched}`);
    logger.log(`  Errors: ${results.errors.length}`);
    
    if (results.totalUnmatched > 0) {
      logger.warn(
        `${results.totalUnmatched} RFC requests could not be automatically linked. ` +
        `Manual review and linking is recommended.`
      );
    }
    
    if (finalConfig.dryRun) {
      logger.warn('DRY RUN MODE - No changes were committed');
    } else {
      logger.success('RFC linking completed!');
    }
    
    logger.log('='.repeat(60));
    
  } catch (error) {
    logger.error(`Fatal error during RFC linking: ${error}`);
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
 * Usage: tsx lib/db/migrations/phase7-migrate-applications.ts [--dry-run] [--verbose] [--link-rfc]
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');
  const linkRFC = args.includes('--link-rfc');
  
  const config = {
    dryRun,
    logLevel: verbose ? 'verbose' as const : 'normal' as const,
  };
  
  (async () => {
    // Run main migration
    const results = await migrateApplications(config);
    
    // Optionally run RFC linking
    if (linkRFC) {
      console.log('\n');
      await linkRFCRequests(config);
    }
    
    process.exit(results.success && results.errors.length === 0 ? 0 : 1);
  })().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

// Export for programmatic use
export default migrateApplications;
