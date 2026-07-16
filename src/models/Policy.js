import mongoose from 'mongoose';

const policySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  pdfUrl: { type: String, required: true }
}, { timestamps: true });

const Policy = mongoose.model('Policy', policySchema);
export default Policy;
