
// HOW TO RUN (from backend project root):
//   node updateSeederImagePaths.js

const fs = require('fs');
const path = require('path');

const SEEDER_PATH = path.join(__dirname, 'seeder.js');
const MAP_PATH = path.join(__dirname, 'cloudinary-url-map.json');

const urlMap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'));
let seederContent = fs.readFileSync(SEEDER_PATH, 'utf-8');

let replacedCount = 0;

for (const [localPath, cloudinaryUrl] of Object.entries(urlMap)) {
  // Matches both: image: "/images/x.webp"  AND  images: ["/images/x.webp"]
  const searchPattern = `"${localPath}"`;
  const replacement = `"${cloudinaryUrl}"`;

  if (seederContent.includes(searchPattern)) {
    seederContent = seederContent.split(searchPattern).join(replacement);
    replacedCount++;
    console.log(`Replaced: ${localPath} -> ${cloudinaryUrl}`);
  } else {
    console.log(`⚠️  Not found in seeder.js (skipped): ${localPath}`);
  }
}

fs.writeFileSync(SEEDER_PATH, seederContent, 'utf-8');
console.log(`\n✅ Done! ${replacedCount} paths replaced in seeder.js.`);