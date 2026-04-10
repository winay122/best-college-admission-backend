import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Get the Singleton Global Settings (Public endpoint for frontend)
export const getGlobalSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.globalSetting.findUnique({
      where: { id: "GLOBAL" }
    });
    
    if (!settings) {
      // If it doesn't exist, create an empty one
      const newSettings = await prisma.globalSetting.create({
        data: { id: "GLOBAL" }
      });
      res.status(200).json({ success: true, data: newSettings });
      return;
    }
    
    res.status(200).json({ success: true, data: settings });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update Global Settings (Admin Only)
export const updateGlobalSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contactEmail, contactPhone, officeHours, officeAddress, logoUrl, footerAbout, copyrightText, socialLinks, availableFacilities } = req.body;
    
    // FETCH THE CURRENT STATE TO CHECK FOR LOGO REPLACEMENT/DELETE OLD UPLOADS
    const currentSettings = await prisma.globalSetting.findUnique({
      where: { id: "GLOBAL" }
    });

    if (currentSettings && currentSettings.logoUrl && currentSettings.logoUrl !== logoUrl) {
      // If the old logo was an upload (contains /uploads/), delete it
      if (currentSettings.logoUrl.includes('/uploads/')) {
        try {
          // Extract filename from the URL (handles both full URLs and relative paths)
          const urlParts = currentSettings.logoUrl.split('/');
          const filename = urlParts[urlParts.length - 1];
          const physicalPath = path.join(process.cwd(), 'public', 'uploads', filename);
          
          await fs.access(physicalPath); // Check if file exists
          await fs.unlink(physicalPath); // Delete it
          console.log(`Successfully purged old Master Logo: ${filename}`);
        } catch (unlinkError) {
          // Log but don't crash if file is already missing
          console.warn('Could not delete old logo file (might have been manually moved)', unlinkError);
        }
      }
    }

    const settings = await prisma.globalSetting.upsert({
      where: { id: "GLOBAL" },
      update: { contactEmail, contactPhone, officeHours, officeAddress, logoUrl, footerAbout, copyrightText, socialLinks, availableFacilities },
      create: { id: "GLOBAL", contactEmail, contactPhone, officeHours, officeAddress, logoUrl, footerAbout, copyrightText, socialLinks, availableFacilities: availableFacilities || [] },
    });
    
    res.status(200).json({ success: true, data: settings });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
