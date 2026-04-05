import { Request, Response } from 'express';
import prisma from '../config/db.js';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.globalSetting.findUnique({ where: { id: 'GLOBAL' } });
    
    if (!settings) {
      // Fallback instance initialization logic
      const defaultSettings = await prisma.globalSetting.create({
        data: { id: 'GLOBAL', banners: [] }
      });
      return res.json({ success: true, data: defaultSettings });
    }
    
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { banners, contactEmail, contactPhone, emailTemplates } = req.body;
    
    const settings = await prisma.globalSetting.upsert({
      where: { id: 'GLOBAL' },
      update: { banners, contactEmail, contactPhone, emailTemplates },
      create: { id: 'GLOBAL', banners: banners || [], contactEmail, contactPhone, emailTemplates }
    });
    
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
