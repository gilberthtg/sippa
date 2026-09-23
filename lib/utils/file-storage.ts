import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Save file to local filesystem (Server-side only)
 */
export async function saveFile(
  buffer: Buffer,
  storageKey: string,
  uploadDir: string = 'uploads'
): Promise<void> {
  const filePath = join(/*turbopackIgnore: true*/ process.cwd(), uploadDir, storageKey);
  const dirPath = join(/*turbopackIgnore: true*/ process.cwd(), uploadDir, storageKey.split('/').slice(0, -1).join('/'));
  
  await mkdir(dirPath, { recursive: true });
  await writeFile(filePath, buffer);
}
