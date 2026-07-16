import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  tagline: { type: String, required: true },
  badge: { type: String },
  colorLight: { type: String },
  colorDark: { type: String },
  path: { type: String, required: true },
  image: { type: String },
  description: { type: String, required: true },
  overviewSpecs: [{
    label: String,
    value: String
  }],
  overviewDetails: [String],
  specs: [{
    label: String,
    value: String
  }],
  features: [String],
  benefits: [String],
  certifications: [String],
  ecoStats: {
    efficiencyValue: Number,
    lifespan: Number,
    carbonPayback: Number,
    energyOutput: Number,
    co2SavedPerKwh: { type: Number, default: 0.4 },
    costSavedPerKwh: { type: Number, default: 10 }
  },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
