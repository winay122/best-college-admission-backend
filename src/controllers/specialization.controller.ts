import { Request, Response } from 'express';
import prisma from '../config/db.js';

export const getAllSpecializations = async (req: Request, res: Response) => {
  try {
    const { degreeId } = req.query;
    const where = degreeId ? { degreeId: String(degreeId) } : {};
    
    const specializations = await prisma.specialization.findMany({
      where,
      include: { degree: true },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: specializations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createSpecialization = async (req: Request, res: Response) => {
  try {
    const { name, degreeId, slug } = req.body;
    const specialization = await prisma.specialization.create({
      data: { 
        name, 
        degreeId, 
        slug: slug || name.toLowerCase().replace(/\s+/g, '-') 
      }
    });
    res.status(201).json({ success: true, data: specialization });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSpecialization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, degreeId, slug } = req.body;
    const specialization = await prisma.specialization.update({
      where: { id },
      data: { name, degreeId, slug }
    });
    res.json({ success: true, data: specialization });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteSpecialization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.specialization.delete({ where: { id } });
    res.json({ success: true, message: 'Specialization deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
