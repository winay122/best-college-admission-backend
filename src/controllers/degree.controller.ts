import { Request, Response } from 'express';
import prisma from '../config/db.js';

export const getDegrees = async (req: Request, res: Response) => {
  try {
    const degrees = await prisma.degree.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: degrees });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createDegree = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    const degree = await prisma.degree.create({ data: { name, slug } });
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
