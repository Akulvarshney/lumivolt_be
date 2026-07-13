import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Paths
const policiesFile = path.join(__dirname, 'src', 'data', 'policies.json');
const productsFile = path.join(__dirname, 'src', 'data', 'products.json');
const galleryFile = path.join(__dirname, 'src', 'data', 'gallery.json');
const downloadsFile = path.join(__dirname, 'src', 'data', 'downloads.json');
const publicDir = path.join(__dirname, 'public');

// Serve static files from public directory
app.use(express.static(publicDir));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, publicDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'image' ? 'product-' : (file.fieldname === 'pdf' ? 'policy-' : 'file-');
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const galleryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, publicDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const galleryUpload = multer({
  storage: galleryStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes

// Get Policies
app.get('/api/policies', (req, res) => {
  try {
    const data = fs.readFileSync(policiesFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read policies' });
  }
});

// Update Policies
app.post('/api/policies', (req, res) => {
  try {
    const newPolicies = req.body;
    fs.writeFileSync(policiesFile, JSON.stringify(newPolicies, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to write policies' });
  }
});

// Get Products
app.get('/api/products', (req, res) => {
  try {
    const data = fs.readFileSync(productsFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read products' });
  }
});

// Update Products
app.post('/api/products', (req, res) => {
  try {
    const newProducts = req.body;
    fs.writeFileSync(productsFile, JSON.stringify(newProducts, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to write products' });
  }
});

// Upload PDF
app.post('/api/upload', upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the public URL path
    res.json({ pdfUrl: `/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload Image
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the public URL path
    res.json({ imageUrl: `/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get Gallery
app.get('/api/gallery', (req, res) => {
  try {
    const data = fs.readFileSync(galleryFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read gallery' });
  }
});

// Update Gallery
app.post('/api/gallery', (req, res) => {
  try {
    const newGallery = req.body;
    fs.writeFileSync(galleryFile, JSON.stringify(newGallery, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to write gallery' });
  }
});

// Delete Gallery Item
app.delete('/api/gallery/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = JSON.parse(fs.readFileSync(galleryFile, 'utf8'));
    const itemIndex = data.findIndex(item => item.id === id);

    if (itemIndex > -1) {
      const item = data[itemIndex];
      if (item.url) {
        const filePath = path.join(publicDir, item.url.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      data.splice(itemIndex, 1);
      fs.writeFileSync(galleryFile, JSON.stringify(data, null, 2), 'utf8');
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
  galleryUpload.single('media')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 5MB limit' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'Upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    res.json({
      url: `/${req.file.filename}`,
      type: type
    });
  });
});

// Get Downloads
app.get('/api/downloads', (req, res) => {
  try {
    const data = fs.readFileSync(downloadsFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read downloads' });
  }
});

// Update Downloads
app.post('/api/downloads', (req, res) => {
  try {
    const newDownloads = req.body;
    fs.writeFileSync(downloadsFile, JSON.stringify(newDownloads, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to write downloads' });
  }
});

// Delete Download Item
app.delete('/api/downloads/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = JSON.parse(fs.readFileSync(downloadsFile, 'utf8'));
    const itemIndex = data.findIndex(item => item.id === id);

    if (itemIndex > -1) {
      const item = data[itemIndex];
      if (item.fileUrl) {
        const filePath = path.join(publicDir, item.fileUrl.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      data.splice(itemIndex, 1);
      fs.writeFileSync(downloadsFile, JSON.stringify(data, null, 2), 'utf8');
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
