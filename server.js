import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import connectDB from './src/config/db.js';
import Policy from './src/models/Policy.js';
import Product from './src/models/Product.js';
import Gallery from './src/models/Gallery.js';
import Download from './src/models/Download.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET || 'uploads';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080;

// Connect to MongoDB
connectDB();

// Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});
app.use(cors());
app.use(express.json());

// Paths
const publicDir = path.join(__dirname, 'public');

// Serve static files from public directory
app.use(express.static(publicDir));

// Configure Multer for file uploads (Memory Storage)
const memoryStorage = multer.memoryStorage();

const upload = multer({ 
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const galleryUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes

// Get Policies
app.get('/api/policies', async (req, res) => {
  try {
    const policies = await Policy.find().lean();
    res.json(policies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read policies' });
  }
});

// Update Policies
app.post('/api/policies', async (req, res) => {
  try {
    const newPolicies = req.body;
    await Policy.deleteMany({});
    if (newPolicies && newPolicies.length > 0) {
      // Avoid _id collision issues if _id was sent from frontend
      const sanitizedPolicies = newPolicies.map(({ _id, ...rest }) => rest);
      await Policy.insertMany(sanitizedPolicies);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to write policies' });
  }
});

// Get Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ order: 1 }).lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read products' });
  }
});

// Get Single Product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ id }).lean();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read product' });
  }
});

// Update Products
app.post('/api/products', async (req, res) => {
  try {
    const newProducts = req.body;
    await Product.deleteMany({});
    if (newProducts && newProducts.length > 0) {
      const sanitizedProducts = newProducts.map(({ _id, ...rest }, index) => ({
        ...rest,
        order: index
      }));
      await Product.insertMany(sanitizedProducts);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to write products' });
  }
});

// Upload PDF
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `policy-${uniqueSuffix}${path.extname(req.file.originalname)}`;
    
    const { error } = await supabase.storage
      .from(supabaseBucket)
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
      
    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage.from(supabaseBucket).getPublicUrl(fileName);
    res.json({ pdfUrl: publicUrlData.publicUrl });
  } catch (error) {
    console.error('PDF Upload failed:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload Image
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `product-${uniqueSuffix}${path.extname(req.file.originalname)}`;
    
    const { error } = await supabase.storage
      .from(supabaseBucket)
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
      
    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage.from(supabaseBucket).getPublicUrl(fileName);
    res.json({ imageUrl: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Image Upload failed:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get Gallery
app.get('/api/gallery', async (req, res) => {
  try {
    const gallery = await Gallery.find().lean();
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read gallery' });
  }
});

// Update Gallery
app.post('/api/gallery', async (req, res) => {
  try {
    const newGallery = req.body;
    await Gallery.deleteMany({});
    if (newGallery && newGallery.length > 0) {
      const sanitizedGallery = newGallery.map(({ _id, ...rest }) => rest);
      await Gallery.insertMany(sanitizedGallery);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to write gallery' });
  }
});

// Delete Gallery Item
app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Gallery.findOne({ id });

    if (item) {
      if (item.url && supabase) {
        const parts = item.url.split('/');
        const fileName = parts[parts.length - 1];
        if (fileName) {
          await supabase.storage.from(supabaseBucket).remove([fileName]);
        }
      }
      await Gallery.deleteOne({ id });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

// Upload Gallery Media
app.post('/api/upload-gallery', (req, res) => {
  galleryUpload.single('media')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 10MB limit' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'Upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });

    try {
      const type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileName = `gallery-${uniqueSuffix}${path.extname(req.file.originalname)}`;
      
      const { error } = await supabase.storage
        .from(supabaseBucket)
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
        
      if (error) throw error;
      
      const { data: publicUrlData } = supabase.storage.from(supabaseBucket).getPublicUrl(fileName);
      
      res.json({
        url: publicUrlData.publicUrl,
        type: type
      });
    } catch (uploadError) {
      console.error('Gallery Upload failed:', uploadError);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
});

// Get Downloads
app.get('/api/downloads', async (req, res) => {
  try {
    const downloads = await Download.find().lean();
    res.json(downloads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read downloads' });
  }
});

// Update Downloads
app.post('/api/downloads', async (req, res) => {
  try {
    const newDownloads = req.body;
    await Download.deleteMany({});
    if (newDownloads && newDownloads.length > 0) {
      const sanitizedDownloads = newDownloads.map(({ _id, ...rest }) => rest);
      await Download.insertMany(sanitizedDownloads);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to write downloads' });
  }
});

// Delete Download Item
app.delete('/api/downloads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Download.findOne({ id });

    if (item) {
      if (item.fileUrl && supabase) {
        const parts = item.fileUrl.split('/');
        const fileName = parts[parts.length - 1];
        if (fileName) {
          await supabase.storage.from(supabaseBucket).remove([fileName]);
        }
      }
      await Download.deleteOne({ id });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete download item' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
