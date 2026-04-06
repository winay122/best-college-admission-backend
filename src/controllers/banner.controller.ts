import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { removeLocalFile } from '../utils/fileRemover.js';

const prisma = new PrismaClient();

// Create Banner
export const createBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageUrl, title, subTitle, linkUrl, isActive, orderIndex } = req.body;
    
    if (!imageUrl) {
      res.status(400).json({ success: false, error: 'Banner Image URL is mandatory.' });
      return;
    }

    const banner = await prisma.banner.create({
      data: { imageUrl, title, subTitle, linkUrl, isActive: Boolean(isActive), orderIndex: Number(orderIndex || 0) },
    });
    res.status(201).json({ success: true, data: banner });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get All Banners (Public - Used by Homepage)
export const getAllBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { orderIndex: 'asc' },
    });
    res.status(200).json({ success: true, data: banners });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update Banner
export const updateBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { imageUrl, title, subTitle, linkUrl, isActive, orderIndex } = req.body;
    
    if (!imageUrl) {
      res.status(400).json({ success: false, error: 'Banner Image URL cannot be empty.' });
      return;
    }

    // Physical file cleanup if image is changed
    if (imageUrl) {
      const oldBanner = await prisma.banner.findUnique({ where: { id } });
      if (oldBanner?.imageUrl && oldBanner.imageUrl !== imageUrl) {
        removeLocalFile(oldBanner.imageUrl);
      }
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: { 
        imageUrl, 
        title, 
        subTitle, 
        linkUrl, 
        isActive: Boolean(isActive), 
        orderIndex: Number(orderIndex) 
      },
    });
    res.status(200).json({ success: true, data: banner });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete Banner
export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const banner = await prisma.banner.findUnique({ where: { id } });
    
    if (banner?.imageUrl) {
      removeLocalFile(banner.imageUrl);
    }

    await prisma.banner.delete({ where: { id } });
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
