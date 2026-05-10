import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { SubjectService } from '../src/modules/courses/subject.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function populate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for Auto-Population");

        const physicsId = '69fba4c530063fe0f33fa7d1';
        const chemistryId = '69fba4c530063fe0f33fa7d4';

        console.log("Populating Physics...");
        await SubjectService.autoGenerateLessons(physicsId);
        
        console.log("Populating Chemistry...");
        await SubjectService.autoGenerateLessons(chemistryId);

        console.log("Auto-population complete!");
        process.exit(0);
    } catch (err) {
        console.error("Population failed:", err);
        process.exit(1);
    }
}

populate();
