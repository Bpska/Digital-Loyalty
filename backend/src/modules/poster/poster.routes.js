import express from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import * as controller from './poster.controller.js';

const router = express.Router();

// ── Super Admin Endpoint protection ──────────────────────────
// List, get, create, update, delete templates
router.get('/templates', authenticate, controller.getAllTemplates);
router.get('/templates/:id', authenticate, controller.getTemplateById);
router.post('/templates', authenticate, authorize(Role.SUPER_ADMIN), controller.createTemplate);
router.put('/templates/:id', authenticate, authorize(Role.SUPER_ADMIN), controller.updateTemplate);
router.delete('/templates/:id', authenticate, authorize(Role.SUPER_ADMIN), controller.deleteTemplate);

// ── Business Admin Endpoints ─────────────────────────────────
// Get and update current business poster setting
router.get('/settings', authenticate, authorize(Role.BUSINESS_ADMIN), controller.getBusinessPosterSetting);
router.put('/settings', authenticate, authorize(Role.BUSINESS_ADMIN), controller.updateBusinessPosterSetting);

export default router;
