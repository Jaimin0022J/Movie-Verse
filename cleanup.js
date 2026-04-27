import fs from 'fs';
import path from 'path';

const GARBAGE_DIRS = ['dist', 'build', 'dist-ssr', '.parcel-cache', 'logs'];
const GARBAGE_EXTS = ['.log', '.eslintcache', '.DS_Store', 'Thumbs.db'];
const IGNORE_DIRS = ['node_modules', '.git', '.github'];

function cleanDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    try {
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            // Skip core protected directories entirely
            if (IGNORE_DIRS.includes(item)) continue;
            
            const fullPath = path.join(dirPath, item);
            let stat;
            try {
                stat = fs.statSync(fullPath);
            } catch (e) {
                continue; // Skip if file was deleted or unreadable
            }

            if (stat.isDirectory()) {
                if (GARBAGE_DIRS.includes(item)) {
                    console.log(`🗑️  Removing directory: ${fullPath}`);
                    fs.rmSync(fullPath, { recursive: true, force: true });
                } else {
                    cleanDirectory(fullPath); // Recurse securely
                }
            } else {
                const isGarbageExt = GARBAGE_EXTS.some(ext => item.endsWith(ext) || item === ext);
                if (isGarbageExt || GARBAGE_DIRS.includes(item)) {
                    console.log(`🗑️  Removing file: ${fullPath}`);
                    fs.rmSync(fullPath, { force: true });
                }
            }
        }
    } catch (err) {
        console.error(`Error scanning directory ${dirPath}:`, err.message);
    }
}

console.log("🧹 Starting Project Cleanup Sequence...");
cleanDirectory(process.cwd());
console.log("✨ Cleanup Complete! All 'garbage' files have been purged.");
