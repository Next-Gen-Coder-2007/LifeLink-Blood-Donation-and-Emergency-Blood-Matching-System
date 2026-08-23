import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import app from '../app.js';
import { seedDatabase } from './seedData.js';

console.log('Testing Admin Controller and Routes module imports...');
import adminRoutes from '../routes/adminRoutes.js';
import * as adminController from '../controllers/adminController.js';

console.log('✅ Admin routes and controller imported successfully.');
console.log('Exported controller actions:', Object.keys(adminController));

process.exit(0);
