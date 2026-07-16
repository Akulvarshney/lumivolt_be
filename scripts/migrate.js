import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import Policy from '../src/models/Policy.js';
import Product from '../src/models/Product.js';
import Gallery from '../src/models/Gallery.js';
import Download from '../src/models/Download.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'src', 'data');

const migrateData = async () => {
  try {
    await connectDB();

    // Read files
    const policiesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'policies.json'), 'utf8'));
    const productsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf8'));
    const galleryData = JSON.parse(fs.readFileSync(path.join(dataDir, 'gallery.json'), 'utf8'));
    const downloadsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'downloads.json'), 'utf8'));

    // Clear existing collections
    await Policy.deleteMany();
    await Product.deleteMany();
    await Gallery.deleteMany();
    await Download.deleteMany();

    // Insert new data
    if (policiesData.length > 0) await Policy.insertMany(policiesData);
    if (productsData.length > 0) await Product.insertMany(productsData);
    if (galleryData.length > 0) await Gallery.insertMany(galleryData);
    if (downloadsData.length > 0) await Download.insertMany(downloadsData);

    console.log('Data migration successful!');
    process.exit(0);
  } catch (error) {
    console.error(`Migration error: ${error.message}`);
    process.exit(1);
  }
};

migrateData();
