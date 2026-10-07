/**
 * Script to push database schema changes
 * This bypasses the interactive prompts in drizzle-kit push
 */
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function pushSchema() {
  try {
    console.log('🔄 Pushing schema changes to database...\n');
    
    // Use drizzle-kit push with --force flag to skip prompts
    const { stdout, stderr } = await execAsync('npx drizzle-kit push --force', {
      env: process.env,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log('\n✅ Schema changes pushed successfully!');
  } catch (error: any) {
    console.error('❌ Error pushing schema:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    process.exit(1);
  }
}

pushSchema();
