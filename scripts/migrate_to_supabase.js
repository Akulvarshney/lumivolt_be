import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import connectDB from '../src/config/db.js';
import Policy from '../src/models/Policy.js';
import Product from '../src/models/Product.js';
import Gallery from '../src/models/Gallery.js';
import Download from '../src/models/Download.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

const supabaseUrl = process.env.SUPABASE_URL.replace('.storage.supabase.co/storage/v1/s3', '.supabase.co');
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET || 'Lumivolt.co.in';

const supabase = createClient(supabaseUrl, supabaseKey);

const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.pdf': return 'application/pdf';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.mp4': return 'video/mp4';
    case '.webm': return 'video/webm';
    default: return 'application/octet-stream';
  }
};

const uploadToSupabase = async (localPath) => {
  if (!localPath || !localPath.startsWith('/')) return localPath; // Not a local path or already a URL
  
  const fullPath = path.join(publicDir, localPath.replace(/^\//, ''));
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found locally: ${fullPath}`);
    return localPath;
  }

  const fileName = localPath.replace(/^\//, '');
  const fileBuffer = fs.readFileSync(fullPath);
  const mimeType = getMimeType(fileName);

  const { data, error } = await supabase.storage
    .from(supabaseBucket)
    .upload(fileName, fileBuffer, {
      contentType: mimeType,
      upsert: true
    });

  if (error) {
    console.error(`Error uploading ${fileName}:`, error.message);
    return localPath;
  }

  const { data: publicUrlData } = supabase.storage.from(supabaseBucket).getPublicUrl(fileName);
  console.log(`Uploaded ${fileName} -> ${publicUrlData.publicUrl}`);
  return publicUrlData.publicUrl;
};

const migrateData = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    // 1. Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets.some(b => b.name === supabaseBucket)) {
      console.log(`Creating bucket: ${supabaseBucket}`);
      const { error: createError } = await supabase.storage.createBucket(supabaseBucket, { public: true });
      if (createError) {
          console.error("Failed to create bucket:", createError);
      }
    }

    // 2. Migrate Policies
    console.log('\n--- Migrating Policies ---');
    const policies = await Policy.find();
    for (let policy of policies) {
      if (policy.pdfUrl && policy.pdfUrl.startsWith('/')) {
        policy.pdfUrl = await uploadToSupabase(policy.pdfUrl);
        await policy.save();
      }
    }

    // 3. Migrate Products
    console.log('\n--- Migrating Products ---');
    const products = await Product.find();
    for (let product of products) {
      if (product.image && product.image.startsWith('/')) {
        product.image = await uploadToSupabase(product.image);
        await product.save();
      }
    }

    // 4. Migrate Gallery
    console.log('\n--- Migrating Gallery ---');
    const galleryItems = await Gallery.find();
    for (let item of galleryItems) {
      if (item.url && item.url.startsWith('/')) {
        item.url = await uploadToSupabase(item.url);
        await item.save();
      }
    }

    // 5. Migrate Downloads
    console.log('\n--- Migrating Downloads ---');
    const downloads = await Download.find();
    for (let download of downloads) {
      if (download.fileUrl && download.fileUrl.startsWith('/')) {
        download.fileUrl = await uploadToSupabase(download.fileUrl);
        await download.save();
      }
    }

    console.log('\nMigration to Supabase completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Migration error: ${error.message}`);
    process.exit(1);
  }
};

migrateData();
