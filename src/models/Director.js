import mongoose from 'mongoose';

const directorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  image: { type: String, required: true },
  bio: { type: String },
  expertise: { type: String },
  experience: { type: String },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const Director = mongoose.model('Director', directorSchema);
export default Director;
