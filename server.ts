import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { DatabaseService } from './src/services/DatabaseService';
import authRoutes from './src/routes/auth';
import teacherRoutes from './src/routes/teachers';
import moduleRoutes from './src/routes/modules';
import assignmentRoutes from './src/routes/assignments';
import messageRoutes from './src/routes/messages';
import parcoursRoutes from './src/routes/parcours';

dotenv.config();

// ================= SERVER =================
async function startServer() {
  await DatabaseService.initDB();

  const app = express();
  app.use(express.json());

  // API Routes
  app.use('/api', authRoutes);
  app.use('/api/teachers', teacherRoutes);
  app.use('/api/modules', moduleRoutes);
  app.use('/api/assignments', assignmentRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/parcours', parcoursRoutes);

  // Serve static files
  app.use(express.static('dist'));

  // Fallback to index.html for SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });

  // ===== START =====
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});