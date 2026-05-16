import { Request, Response } from 'express';
import prisma from '../config/db.js';

export const getDegrees = async (req: Request, res: Response) => {
  try {
    // Sort by sortOrder first, then name as secondary for ties
    const degrees = await prisma.degree.findMany({
      orderBy: [{ sortOrder: 'asc' } as any, { name: 'asc' }]
    });
    res.json({ success: true, data: degrees });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createDegree = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    // Auto-assign sortOrder as last position
    const count = await prisma.degree.count();
    const degree = await prisma.degree.create({ data: { name, slug, sortOrder: count } as any });
    res.status(201).json({ success: true, data: degree });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDegree = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    const degree = await prisma.degree.update({
      where: { id: req.params.id },
      data: { name, slug }
    });
    res.json({ success: true, data: degree });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteDegree = async (req: Request, res: Response) => {
  try {
    await prisma.degree.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Batch reorder: receives array of { id, sortOrder } and updates all
export const reorderDegrees = async (req: Request, res: Response) => {
  try {
    const { orders } = req.body as { orders: { id: string; sortOrder: number }[] };
    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, error: 'orders must be an array' });
    }
    // Run all updates in a single transaction
    await prisma.$transaction(
      orders.map(({ id, sortOrder }) =>
        prisma.degree.update({ where: { id }, data: { sortOrder } as any })
      )
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
