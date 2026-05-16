import { Request, Response } from 'express';
import prisma from '../config/db.js';

// Helper to generate SEO friendly slugs
const generateSlug = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export const getAllPages = async (req: Request, res: Response) => {
  try {
    const { isPublished } = req.query;
    const where: any = {};
    if (isPublished === 'true') where.isPublished = true;
    if (isPublished === 'false') where.isPublished = false;

    const pages = await prisma.staticPage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    res.json({ success: true, data: pages });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPageBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const page = await prisma.staticPage.findUnique({
      where: { slug },
    });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    res.json({ success: true, data: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createPage = async (req: Request, res: Response) => {
  try {
    const { title, content, isPublished } = req.body;
    
    // Generate unique slug
    let baseSlug = generateSlug(title);
    let slug = baseSlug;
    let count = 1;
    while (await prisma.staticPage.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const page = await prisma.staticPage.create({
      data: {
        title,
        slug,
        content,
        isPublished: isPublished !== undefined ? isPublished : true,
      },
    });
    
    res.status(201).json({ success: true, data: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, isPublished } = req.body;
    
    let updateData: any = {
      title,
      content,
      isPublished,
    };

    if (title) {
      const existing = await prisma.staticPage.findUnique({ where: { id } });
      if (existing && existing.title !== title) {
        let baseSlug = generateSlug(title);
        let slug = baseSlug;
        let count = 1;
        while (true) {
          const check = await prisma.staticPage.findUnique({ where: { slug } });
          if (!check || check.id === id) break;
          slug = `${baseSlug}-${count}`;
          count++;
        }
        updateData.slug = slug;
      }
    }

    const page = await prisma.staticPage.update({
      where: { id },
      data: updateData,
    });
    
    res.json({ success: true, data: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deletePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.staticPage.delete({ where: { id } });
    res.json({ success: true, message: 'Page deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
