import { Request, Response } from 'express';
import prisma from '../config/db.js';

export const getUniversities = async (req: Request, res: Response) => {
  try {
    const universities = await prisma.university.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: universities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createUniversity = async (req: Request, res: Response) => {
  try {
    const { name, shortName, slug } = req.body;
    const university = await prisma.university.create({
      data: { name, shortName, slug }
    });
    res.status(201).json({ success: true, data: university });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateUniversity = async (req: Request, res: Response) => {
  try {
    const { name, shortName, slug } = req.body;
    const university = await prisma.university.update({
      where: { id: req.params.id },
      data: { name, shortName, slug }
    });
    res.json({ success: true, data: university });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteUniversity = async (req: Request, res: Response) => {
  try {
    await prisma.university.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
