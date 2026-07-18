import prisma from '../../config/prisma.js';
import { logger } from '../../utils/logger.js';

// ── Default templates to seed ──────────────────────────────────
const DEFAULT_TEMPLATES = [
  // ── Cafe ──
  {
    name: "Classic Coffee Theme",
    category: "Café",
    backgroundImage: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
    logoPosition: { x: 50, y: 15, w: 20, h: 20 },
    businessNamePosition: { x: 50, y: 40, fontSize: 26, color: "#451A03", fontWeight: "bold" },
    qrPosition: { x: 50, y: 62, w: 32, h: 32 },
    phonePosition: { x: 50, y: 86, fontSize: 14, color: "#78350F" },
    addressPosition: { x: 50, y: 91, fontSize: 12, color: "#9A3412" },
    status: true
  },
  {
    name: "Minimalist Modern",
    category: "Café",
    backgroundImage: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)",
    logoPosition: { x: 50, y: 18, w: 18, h: 18 },
    businessNamePosition: { x: 50, y: 42, fontSize: 24, color: "#0F172A", fontWeight: "bold" },
    qrPosition: { x: 50, y: 64, w: 30, h: 30 },
    phonePosition: { x: 50, y: 88, fontSize: 13, color: "#475569" },
    addressPosition: { x: 50, y: 92, fontSize: 11, color: "#64748B" },
    status: true
  },
  {
    name: "Warm Rustic",
    category: "Café",
    backgroundImage: "linear-gradient(135deg, #FEF3C7 0%, #D97706 100%)",
    logoPosition: { x: 50, y: 15, w: 22, h: 22 },
    businessNamePosition: { x: 50, y: 41, fontSize: 28, color: "#FFFBEB", fontWeight: "bold" },
    qrPosition: { x: 50, y: 63, w: 28, h: 28 },
    phonePosition: { x: 50, y: 85, fontSize: 14, color: "#FEF3C7" },
    addressPosition: { x: 50, y: 90, fontSize: 12, color: "#FFFBEB" },
    status: true
  },

  // ── Restaurant ──
  {
    name: "Elegant Family Dining",
    category: "Restaurant",
    backgroundImage: "linear-gradient(135deg, #FFF5F5 0%, #FED7D7 100%)",
    logoPosition: { x: 50, y: 16, w: 20, h: 20 },
    businessNamePosition: { x: 50, y: 39, fontSize: 26, color: "#742A2A", fontWeight: "bold" },
    qrPosition: { x: 50, y: 62, w: 32, h: 32 },
    phonePosition: { x: 50, y: 86, fontSize: 14, color: "#9B2C2C" },
    addressPosition: { x: 50, y: 91, fontSize: 12, color: "#C53030" },
    status: true
  },
  {
    name: "Premium Dining",
    category: "Restaurant",
    backgroundImage: "linear-gradient(135deg, #1A202C 0%, #2D3748 100%)",
    logoPosition: { x: 50, y: 15, w: 22, h: 22 },
    businessNamePosition: { x: 50, y: 42, fontSize: 28, color: "#F7FAFC", fontWeight: "bold" },
    qrPosition: { x: 50, y: 64, w: 30, h: 30 },
    phonePosition: { x: 50, y: 88, fontSize: 14, color: "#E2E8F0" },
    addressPosition: { x: 50, y: 92, fontSize: 12, color: "#CBD5E0" },
    status: true
  },

  // ── Hotel ──
  {
    name: "Luxury Gold",
    category: "Hotel",
    backgroundImage: "linear-gradient(135deg, #1E1B4B 0%, #311042 100%)",
    logoPosition: { x: 50, y: 18, w: 20, h: 20 },
    businessNamePosition: { x: 50, y: 44, fontSize: 26, color: "#FCD34D", fontWeight: "bold" },
    qrPosition: { x: 50, y: 66, w: 30, h: 30 },
    phonePosition: { x: 50, y: 89, fontSize: 13, color: "#FFFBEB" },
    addressPosition: { x: 50, y: 93, fontSize: 11, color: "#FCD34D" },
    status: true
  },
  {
    name: "Reception Stand",
    category: "Hotel",
    backgroundImage: "linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)",
    logoPosition: { x: 50, y: 15, w: 20, h: 20 },
    businessNamePosition: { x: 50, y: 39, fontSize: 25, color: "#0F766E", fontWeight: "bold" },
    qrPosition: { x: 50, y: 62, w: 32, h: 32 },
    phonePosition: { x: 50, y: 86, fontSize: 14, color: "#115E59" },
    addressPosition: { x: 50, y: 91, fontSize: 12, color: "#134E4A" },
    status: true
  },

  // ── Salon ──
  {
    name: "Rose Blossom Minimalist",
    category: "Salon",
    backgroundImage: "linear-gradient(135deg, #FFF5F7 0%, #FCE7F3 100%)",
    logoPosition: { x: 50, y: 16, w: 20, h: 20 },
    businessNamePosition: { x: 50, y: 40, fontSize: 26, color: "#9D174D", fontWeight: "bold" },
    qrPosition: { x: 50, y: 62, w: 32, h: 32 },
    phonePosition: { x: 50, y: 86, fontSize: 14, color: "#BE185D" },
    addressPosition: { x: 50, y: 91, fontSize: 12, color: "#DB2777" },
    status: true
  },

  // ── Gym ──
  {
    name: "Hyper Athletics",
    category: "Gym",
    backgroundImage: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    logoPosition: { x: 50, y: 16, w: 20, h: 20 },
    businessNamePosition: { x: 50, y: 40, fontSize: 26, color: "#F97316", fontWeight: "bold" },
    qrPosition: { x: 50, y: 62, w: 32, h: 32 },
    phonePosition: { x: 50, y: 86, fontSize: 14, color: "#F1F5F9" },
    addressPosition: { x: 50, y: 91, fontSize: 12, color: "#94A3B8" },
    status: true
  },

  // ── Grocery ──
  {
    name: "Fresh Foods Organic",
    category: "Grocery",
    backgroundImage: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
    logoPosition: { x: 50, y: 16, w: 20, h: 20 },
    businessNamePosition: { x: 50, y: 40, fontSize: 26, color: "#166534", fontWeight: "bold" },
    qrPosition: { x: 50, y: 62, w: 32, h: 32 },
    phonePosition: { x: 50, y: 86, fontSize: 14, color: "#15803D" },
    addressPosition: { x: 50, y: 91, fontSize: 12, color: "#166534" },
    status: true
  },

  // ── Boutique ──
  {
    name: "Fashion Boutique Premium",
    category: "Boutique",
    backgroundImage: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)",
    logoPosition: { x: 50, y: 16, w: 20, h: 20 },
    businessNamePosition: { x: 50, y: 40, fontSize: 26, color: "#581C87", fontWeight: "bold" },
    qrPosition: { x: 50, y: 62, w: 32, h: 32 },
    phonePosition: { x: 50, y: 86, fontSize: 14, color: "#6B21A8" },
    addressPosition: { x: 50, y: 91, fontSize: 12, color: "#7E22CE" },
    status: true
  },

  // ── Spa ──
  {
    name: "Zen Serenity",
    category: "Spa",
    backgroundImage: "linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)",
    logoPosition: { x: 50, y: 16, w: 20, h: 20 },
    businessNamePosition: { x: 50, y: 40, fontSize: 26, color: "#0F766E", fontWeight: "bold" },
    qrPosition: { x: 50, y: 62, w: 32, h: 32 },
    phonePosition: { x: 50, y: 86, fontSize: 14, color: "#115E59" },
    addressPosition: { x: 50, y: 91, fontSize: 12, color: "#134E4A" },
    status: true
  },

  // ── Clinic ──
  {
    name: "Medical Clinic Theme",
    category: "Clinic",
    backgroundImage: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)",
    logoPosition: { x: 50, y: 16, w: 20, h: 20 },
    businessNamePosition: { x: 50, y: 40, fontSize: 26, color: "#075985", fontWeight: "bold" },
    qrPosition: { x: 50, y: 62, w: 32, h: 32 },
    phonePosition: { x: 50, y: 86, fontSize: 14, color: "#0369A1" },
    addressPosition: { x: 50, y: 91, fontSize: 12, color: "#075985" },
    status: true
  },

  // ── Other ──
  {
    name: "Standard Minimal Theme",
    category: "Other",
    backgroundImage: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
    logoPosition: { x: 50, y: 16, w: 20, h: 20 },
    businessNamePosition: { x: 50, y: 40, fontSize: 26, color: "#0F172A", fontWeight: "bold" },
    qrPosition: { x: 50, y: 62, w: 32, h: 32 },
    phonePosition: { x: 50, y: 86, fontSize: 14, color: "#334155" },
    addressPosition: { x: 50, y: 91, fontSize: 12, color: "#475569" },
    status: true
  }
];

// ── Auto-seeder ────────────────────────────────────────────────
export async function seedPosterTemplates() {
  try {
    const count = await prisma.posterTemplate.count();
    if (count === 0) {
      await prisma.posterTemplate.createMany({
        data: DEFAULT_TEMPLATES
      });
      logger.info('✅ Default poster templates seeded successfully.');
    }
  } catch (err) {
    logger.error('Failed to seed poster templates', { err });
  }
}

// ── Super Admin handlers ───────────────────────────────────────
export async function getAllTemplates(req, res, next) {
  try {
    const { category } = req.query;
    let where = {};
    
    if (category) {
      const normalized = category.trim().toLowerCase();
      
      // Category map normalization
      let matchingCategories = [category];
      if (normalized === 'cafe' || normalized === 'café') {
        matchingCategories = ['Café', 'Cafe'];
      } else if (normalized === 'hotel' || normalized === 'hotels') {
        matchingCategories = ['Hotel', 'Hotels'];
      } else if (normalized === 'salon') {
        matchingCategories = ['Salon'];
      } else if (normalized === 'gym') {
        matchingCategories = ['Gym'];
      } else if (normalized === 'grocery') {
        matchingCategories = ['Grocery'];
      } else if (normalized === 'boutique') {
        matchingCategories = ['Boutique'];
      } else if (normalized === 'clinic') {
        matchingCategories = ['Clinic'];
      } else if (normalized === 'spa') {
        matchingCategories = ['Spa'];
      } else if (normalized === 'restaurant') {
        matchingCategories = ['Restaurant'];
      }

      where = {
        category: { in: matchingCategories },
        status: true
      };
    }

    let templates = await prisma.posterTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Fallback: If no templates match this specific category, fetch all active templates so the screen is never empty
    if (templates.length === 0) {
      templates = await prisma.posterTemplate.findMany({
        where: { status: true },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
}

export async function getTemplateById(req, res, next) {
  try {
    const { id } = req.params;
    const template = await prisma.posterTemplate.findUnique({ where: { id } });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function createTemplate(req, res, next) {
  try {
    const { name, category, backgroundImage, logoPosition, qrPosition, businessNamePosition, phonePosition, addressPosition, status } = req.body;
    const template = await prisma.posterTemplate.create({
      data: {
        name,
        category,
        backgroundImage,
        logoPosition,
        qrPosition,
        businessNamePosition,
        phonePosition,
        addressPosition,
        status: status !== undefined ? status : true
      }
    });
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function updateTemplate(req, res, next) {
  try {
    const { id } = req.params;
    const { name, category, backgroundImage, logoPosition, qrPosition, businessNamePosition, phonePosition, addressPosition, status } = req.body;
    const template = await prisma.posterTemplate.update({
      where: { id },
      data: {
        name,
        category,
        backgroundImage,
        logoPosition,
        qrPosition,
        businessNamePosition,
        phonePosition,
        addressPosition,
        status
      }
    });
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function deleteTemplate(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.posterTemplate.delete({ where: { id } });
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ── Business Admin handlers ────────────────────────────────────
export async function getBusinessPosterSetting(req, res, next) {
  try {
    // Determine business ID based on logged in user
    const business = await prisma.business.findFirst({
      where: { ownerId: req.user.id }
    });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    let setting = await prisma.businessPosterSetting.findUnique({
      where: { businessId: business.id }
    });

    if (!setting) {
      setting = await prisma.businessPosterSetting.create({
        data: { businessId: business.id }
      });
    }

    // Load template details
    let template = null;
    if (setting.selectedTemplateId) {
      template = await prisma.posterTemplate.findUnique({
        where: { id: setting.selectedTemplateId }
      });
    }

    // Get branches to provide branch QR codes and check-in URLs
    const branches = await prisma.branch.findMany({
      where: { businessId: business.id, isActive: true }
    });

    res.json({
      success: true,
      data: {
        setting,
        template,
        business: {
          name: business.name,
          category: business.category,
          logoUrl: business.logoUrl,
          phone: business.phone,
          address: business.address
        },
        branches: branches.map(b => ({
          id: b.id,
          name: b.name,
          qrImage: b.qrImage,
          qrPayload: b.qrPayload || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkin?businessId=${business.id}&branchId=${b.id}&token=${b.qrToken}`
        }))
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateBusinessPosterSetting(req, res, next) {
  try {
    const { selectedTemplateId } = req.body;
    const business = await prisma.business.findFirst({
      where: { ownerId: req.user.id }
    });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const setting = await prisma.businessPosterSetting.upsert({
      where: { businessId: business.id },
      create: { businessId: business.id, selectedTemplateId },
      update: { selectedTemplateId }
    });

    res.json({ success: true, data: setting });
  } catch (err) {
    next(err);
  }
}
