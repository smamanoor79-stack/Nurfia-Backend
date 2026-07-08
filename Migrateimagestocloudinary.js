// migrateImagesToCloudinary.js
//
// ONE-TIME SCRIPT — run from your backend project root (nurfia-backend).
// 1. Uploads every file in public/images to Cloudinary
// 2. Updates every Product document in MongoDB to use the new Cloudinary URLs
// 3. Saves a local mapping file (cloudinary-url-map.json) so you can also
//    update seeder.js manually afterwards (so future re-seeds don't revert).
//
// HOW TO RUN:
//   node migrateImagesToCloudinary.js
//
// BEFORE RUNNING — double check these two lines match your actual project:
//   - require('./config/cloudinary')  -> path/export must match your real file
//   - require('./models/Product')     -> path must match your real model
//   - process.env.MONGO_URI           -> must match the variable name in your .env


const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const { cloudinary } = require('./config/cloudinary'); 
const Product = require('./models/Product');

const IMAGES_DIR = path.join(__dirname, 'public', 'images');

async function migrate() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected!');

    // 2. Read all files in public/images
    const files = fs.readdirSync(IMAGES_DIR);
    console.log(`Found ${files.length} files in public/images`);

    // 3. Upload each file to Cloudinary, build map: "/images/file.ext" -> cloudinary URL
    const urlMap = {};

    for (const file of files) {
      const filePath = path.join(IMAGES_DIR, file);
      const localPath = `/images/${file}`; // matches how it's stored in DB right now

      console.log(`Uploading ${file}...`);

      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'nurfia-products',
          resource_type: 'auto', // handles both images AND .mp4 videos
        });

        urlMap[localPath] = result.secure_url;
        console.log(`✅ ${file} -> ${result.secure_url}`);
      } catch (uploadErr) {
        console.error(`❌ Failed to upload ${file}:`, uploadErr.message);
      }
    }

    // 4. Save the mapping for reference / for updating seeder.js manually
    fs.writeFileSync(
      path.join(__dirname, 'cloudinary-url-map.json'),
      JSON.stringify(urlMap, null, 2)
    );
    console.log('\n📄 URL mapping saved to cloudinary-url-map.json');

    // 5. Update every Product document in the database
    const products = await Product.find({});
    console.log(`\nUpdating ${products.length} products in database...`);

    let updatedCount = 0;

    for (const product of products) {
      let changed = false;

      // single "image" field
      if (product.image && urlMap[product.image]) {
        product.image = urlMap[product.image];
        changed = true;
      }

      // "images" array
      if (Array.isArray(product.images)) {
        const newImages = product.images.map((img) => urlMap[img] || img);
        if (JSON.stringify(newImages) !== JSON.stringify(product.images)) {
          product.images = newImages;
          changed = true;
        }
      }

      if (changed) {
        await product.save();
        updatedCount++;
        console.log(`Updated: ${product.name}`);
      }
    }

    console.log(`\n✅ Migration complete! ${updatedCount} products updated.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();