import { Request, Response } from 'express';
import prisma from '../config/db.js';

// Helper to generate SEO friendly slugs
const generateSlug = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export const getAllNews = async (req: Request, res: Response) => {
  try {
    const { isPublished } = req.query;
    
    const where: any = {};
    if (isPublished === 'true') where.isPublished = true;
    if (isPublished === 'false') where.isPublished = false;

    const news = await prisma.newsArticle.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      include: {
        degree: true
      }
    });
    
    res.json({ success: true, data: news });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getNewsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // We are passing slug as id
    console.log(`[getNewsById] Received request for id/slug: "${id}"`);
    
    // 1. Try finding by slug first
    let news = await prisma.newsArticle.findUnique({
      where: { slug: id },
      include: {
        degree: true
      }
    });

    console.log(`[getNewsById] Result of findUnique by slug:`, news ? `Found (ID: ${news.id})` : `Not Found`);

    // 2. If not found by slug, and it looks like a UUID, try finding by ID
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
    
    if (!news && isUuid) {
      console.log(`[getNewsById] Falling back to UUID lookup for: "${id}"`);
      news = await prisma.newsArticle.findUnique({
        where: { id },
        include: {
          degree: true
        }
      });
      console.log(`[getNewsById] Result of findUnique by ID:`, news ? `Found (ID: ${news.id})` : `Not Found`);
    }
    
    if (!news) {
      console.log(`[getNewsById] Returning 404 for: "${id}"`);
      return res.status(404).json({ success: false, message: 'News article not found' });
    }

    res.json({ success: true, data: news });
  } catch (error: any) {
    console.error("Error in getNewsById:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createNews = async (req: Request, res: Response) => {
  try {
    const { title, excerpt, content, imageUrl, category, degreeId, linkUrl, isPublished, publishedAt } = req.body;
    
    // Generate unique slug
    let baseSlug = generateSlug(title);
    let slug = baseSlug;
    let count = 1;
    while (await prisma.newsArticle.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const news = await prisma.newsArticle.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        imageUrl,
        category,
        degreeId: degreeId || null,
        linkUrl,
        isPublished: isPublished !== undefined ? isPublished : true,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
    });
    
    res.status(201).json({ success: true, data: news });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, imageUrl, category, degreeId, linkUrl, isPublished, publishedAt } = req.body;
    
    let updateData: any = {
      title,
      excerpt,
      content,
      imageUrl,
      category,
      degreeId: degreeId || null,
      linkUrl,
      isPublished,
      ...(publishedAt && { publishedAt: new Date(publishedAt) }),
    };

    if (title) {
      const existing = await prisma.newsArticle.findUnique({ where: { id } });
      if (existing && (existing.title !== title || !existing.slug)) {
        let baseSlug = generateSlug(title);
        let slug = baseSlug;
        let count = 1;
        while (true) {
          const check = await prisma.newsArticle.findUnique({ where: { slug } });
          if (!check || check.id === id) break;
          slug = `${baseSlug}-${count}`;
          count++;
        }
        updateData.slug = slug;
      }
    }

    const news = await prisma.newsArticle.update({
      where: { id },
      data: updateData,
    });
    
    res.json({ success: true, data: news });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.newsArticle.delete({ where: { id } });
    res.json({ success: true, message: 'News article deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
