import 'dotenv/config';
import mongoose from 'mongoose';
import Director from '../src/models/Director.js';
import connectDB from '../src/config/db.js';

const directors = [
  {
    id: `director-${Date.now()}-1`,
    name: "Samarth Wadhwa",
    role: "Director",
    image: "data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='400' fill='%236b7280'/%3E%3C/svg%3E",
    bio: "Strategic operations leader overseeing manufacturing excellence and scaling operations for sustainable growth.",
    expertise: "Renewable Energy Infrastructure, Strategic Scaling & Operational Excellence",
    experience: "15+ years in clean energy sector",
    order: 0
  },
  {
    id: `director-${Date.now()}-2`,
    name: "Pankaj Gupta",
    role: "Director",
    image: "data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='400' fill='%236b7280'/%3E%3C/svg%3E",
    bio: "Technical innovator specializing in advanced photovoltaic technologies and product development.",
    expertise: "Industrial Lifecycle Management, Retail Operations & Photovoltaic R&D",
    experience: "30+ year experience in Industrial Operation, Retail and 5+ years experience in clean energy sector",
    order: 1
  },
  {
    id: `director-${Date.now()}-3`,
    name: "Mukesh Tyagi",
    role: "Director",
    image: "data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='400' fill='%236b7280'/%3E%3C/svg%3E",
    bio: "Market strategist with deep insights into solar energy distribution and business development.",
    expertise: "Advanced Manufacturing, Retail Supply Chain & Clean-Tech Market Strategy",
    experience: "25+ years experience in Manufacturing and Retail, 5+ years experience in clean energy sector",
    order: 2
  },
  {
    id: `director-${Date.now()}-4`,
    name: "Rajkumar Chaudhary",
    role: "Director",
    image: "data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='400' fill='%236b7280'/%3E%3C/svg%3E",
    bio: "Quality assurance expert ensuring world-class manufacturing standards and operational efficiency.",
    expertise: "Quality Assurance (QA), TQM, & Industrial Process Optimization",
    experience: "25+ years experience in Manufacturing quality",
    order: 3
  },
  {
    id: `director-${Date.now()}-5`,
    name: "Surekha",
    role: "Director",
    image: "data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='400' fill='%236b7280'/%3E%3C/svg%3E",
    bio: "Strategic advisor providing expertise in stakeholder engagement and sustainable business practices.",
    expertise: "Corporate Governance, ESG Strategy & Stakeholder Relations",
    experience: "20+ years experience in corporate strategy",
    order: 4
  },
  {
    id: `director-${Date.now()}-6`,
    name: "Devyanshu Singhal",
    role: "Promoter",
    image: "data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='400' fill='%236b7280'/%3E%3C/svg%3E",
    bio: "Visionary leader driving Lumivolt's mission to revolutionize solar energy accessibility with innovative manufacturing solutions.",
    expertise: "Venture Growth, Multi-Sector Operations & Clean Energy Transformation",
    experience: "5+ years in Manufacturing, Retail and clean energy sector",
    order: 5
  }
];

const seedDB = async () => {
  await connectDB();
  await Director.deleteMany({});
  await Director.insertMany(directors);
  console.log("Directors seeded successfully!");
  process.exit();
};

seedDB();
