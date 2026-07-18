import express from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import * as controller from './poster.controller.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../../config/env.js';

const router = express.Router();

// ── File upload config for poster templates background ─────────────────
const templateStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.resolve(env.UPLOAD_DIR, 'templates');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `template-${Date.now()}${ext}`);
  },
});
const uploadTemplate = multer({
  storage: templateStorage,
  limits: { fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

// ── Super Admin Endpoint protection ──────────────────────────
// List, get, create, update, delete templates
router.get('/templates', authenticate, controller.getAllTemplates);
router.get('/templates/:id', authenticate, controller.getTemplateById);
router.post('/templates', authenticate, authorize(Role.SUPER_ADMIN), uploadTemplate.single('backgroundImageFile'), controller.createTemplate);
router.put('/templates/:id', authenticate, authorize(Role.SUPER_ADMIN), uploadTemplate.single('backgroundImageFile'), controller.updateTemplate);
router.delete('/templates/:id', authenticate, authorize(Role.SUPER_ADMIN), controller.deleteTemplate);

// ── Business Admin Endpoints ─────────────────────────────────
// Get and update current business poster setting
router.get('/settings', authenticate, authorize(Role.BUSINESS_ADMIN), controller.getBusinessPosterSetting);
router.put('/settings', authenticate, authorize(Role.BUSINESS_ADMIN), controller.updateBusinessPosterSetting);

export default router;
