import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { seedDatabaseIfEmpty } from './seed';
import { Department } from './models/Department';
import companyRoutes from './routes/companyRoutes';
import employeeRoutes from './routes/employeeRoutes';
import aiEmployeeRoutes from './routes/aiEmployeeRoutes';
import taskRoutes from './routes/taskRoutes';
import goalRoutes from './routes/goalRoutes';
import structureRoutes from './routes/structureRoutes';
import activityRoutes from './routes/activityRoutes';
import notificationRoutes from './routes/notificationRoutes';
import reportRoutes from './routes/reportRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === frontendUrl ||
      origin === 'http://localhost:5173' ||
      origin === 'http://127.0.0.1:5173' ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Founder OS V1 Core Backend',
    database: 'MongoDB Atlas',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/company', companyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/ai-employees', aiEmployeeRoutes);
app.use('/api/ai', aiEmployeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api', structureRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

const startServer = async () => {
  try {
    await connectDB();
    await seedDatabaseIfEmpty();
    try {
      await Department.collection.dropIndex('name_1');
      console.log('Dropped legacy global name_1 index on departments');
    } catch {
      // index already absent — noop
    }
    app.listen(port, () => {
      console.log(`Founder OS Backend active on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
  }
};

startServer();
