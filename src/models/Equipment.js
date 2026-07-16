import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  desc: { type: String, required: true },
  color: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const Equipment = mongoose.model('Equipment', equipmentSchema);
export default Equipment;
