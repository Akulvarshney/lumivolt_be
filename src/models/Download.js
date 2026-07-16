import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  fileUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Download = mongoose.model('Download', downloadSchema);
export default Download;
