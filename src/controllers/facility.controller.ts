import { Request, Response } from 'express';
import prisma from '../config/db.js';

export const getFacilities = async (req: Request, res: Response) => {
  try {
    const { activeOnly } = req.query;
    const where = activeOnly === 'true' ? { isActive: true } : {};
    
    const facilities = await prisma.facility.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
};

export const createFacility = async (req: Request, res: Response) => {
  try {
    const { name, icon, isActive } = req.body;
    
    const exists = await prisma.facility.findUnique({
      where: { name: name.trim() }
    });
    
    if (exists) {
      return res.status(400).json({ error: 'Facility already exists' });
    }
    
    const facility = await prisma.facility.create({
      data: {
        name: name.trim(),
        icon,
        isActive: isActive !== undefined ? isActive : true,
      }
    });
    
    res.status(201).json(facility);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create facility' });
  }
};

export const updateFacility = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, icon, isActive } = req.body;
    
    // Check if new name conflicts with another record
    if (name) {
      const exists = await prisma.facility.findUnique({
        where: { name: name.trim() }
      });
      if (exists && exists.id !== id) {
        return res.status(400).json({ error: 'Another facility with this name already exists' });
      }
    }
    
    const facility = await prisma.facility.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(icon !== undefined && { icon }),
        ...(isActive !== undefined && { isActive }),
      }
    });
    
    res.json(facility);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update facility' });
  }
};

export const deleteFacility = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.facility.delete({ where: { id } });
    res.json({ message: 'Facility deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete facility' });
  }
};
