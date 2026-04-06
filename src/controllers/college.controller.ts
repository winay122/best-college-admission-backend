import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { removeLocalFile } from '../utils/fileRemover.js';

/* =========================================================
   CORE MODULE
========================================================= */
export const getColleges = async (req: Request, res: Response) => {
  try {
    const { 
      degreeId, 
      specializationId, 
      city, 
      state, 
      ownershipType, 
      minFee, 
      maxFee,
      search 
    } = req.query;

    const where: any = {};

    // Text Search
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { city: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    // Categorical Filters
    if (city) where.city = String(city);
    if (state) where.state = String(state);
    if (ownershipType) where.ownershipType = String(ownershipType);

    // Degree & Specialization Filters (Nested in courses)
    if (degreeId || specializationId || minFee || maxFee) {
      where.courses = {
        some: {
          ...(degreeId && { degreeId: String(degreeId) }),
          ...(specializationId && { specializationId: String(specializationId) }),
          ...( (minFee || maxFee) && {
            discountedFee: {
              ...(minFee && { gte: Number(minFee) }),
              ...(maxFee && { lte: Number(maxFee) })
            }
          })
        }
      };
    }

    const colleges = await prisma.college.findMany({
      where,
      include: { 
        info: true, 
        placement: true, 
        rankings: true, 
        galleries: true, 
        courses: {
          include: { degree: true, specialization: true }
        },
        university: true,
        accreditations: true,
        deadlines: true,
        faqs: true
      },
      orderBy: { priorityScore: 'desc' }
    });
    res.json({ success: true, data: colleges });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCollegeById = async (req: Request, res: Response) => {
  try {
    const college = await prisma.college.findUnique({
      where: { id: req.params.id },
      include: { 
        info: true, 
        placement: true, 
        rankings: true, 
        galleries: true, 
        courses: true,
        university: true,
        accreditations: true,
        deadlines: true,
        faqs: true
      }
    });
    res.json({ success: true, data: college });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createCollege = async (req: Request, res: Response) => {
  try {
    const { 
      name, city, state, logoUrl, priorityScore, facilities, 
      hostelAvailable, universityId, collegeType, ownershipType, rating 
    } = req.body;
    
    const college = await prisma.college.create({
      data: {
        name, city, state, logoUrl, 
        priorityScore: Number(priorityScore || 0), 
        rating: Number(rating || 0),
        ownershipType,
        facilities: facilities || [], 
        hostelAvailable: hostelAvailable || false,
        universityId,
        collegeType,
        info: { create: { aboutHtml: '', highlightsHtml: '', admissionsHtml: '', scholarshipHtml: '' } },
        placement: { create: { highestPackage: null, averagePackage: null, placementPercent: null, topRecruiters: [] } }
      }
    });
    res.status(201).json({ success: true, data: college });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateCollege = async (req: Request, res: Response) => {
  try {
    const { 
      name, city, state, logoUrl, priorityScore, facilities, 
      hostelAvailable, universityId, collegeType, ownershipType, rating 
    } = req.body;
    
    if (logoUrl) {
      const old = await prisma.college.findUnique({ where: { id: req.params.id } });
      if (old?.logoUrl && old.logoUrl !== logoUrl) removeLocalFile(old.logoUrl);
    }

    const updated = await prisma.college.update({
      where: { id: req.params.id },
      data: { 
        name, city, state, logoUrl, 
        priorityScore: Number(priorityScore), 
        rating: Number(rating),
        ownershipType,
        facilities, 
        hostelAvailable,
        universityId,
        collegeType
      }
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteCollege = async (req: Request, res: Response) => {
  try {
    await prisma.college.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Purged entirely via cascades.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================================================
   INFO & PLACEMENT MODULES (1:1)
========================================================= */
export const updateInfo = async (req: Request, res: Response) => {
  try {
    const { aboutHtml, highlightsHtml, admissionsHtml, scholarshipHtml } = req.body;
    const info = await prisma.collegeInfo.update({
      where: { collegeId: req.params.id },
      data: { aboutHtml, highlightsHtml, admissionsHtml, scholarshipHtml }
    });
    res.json({ success: true, data: info });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePlacement = async (req: Request, res: Response) => {
  try {
    const { highestPackage, averagePackage, placementPercent, topRecruiters } = req.body;
    const p = await prisma.placement.update({
      where: { collegeId: req.params.id },
      data: { highestPackage: Number(highestPackage), averagePackage: Number(averagePackage), placementPercent: Number(placementPercent), topRecruiters }
    });
    res.json({ success: true, data: p });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================================================
   COURSES MODULE (1:Many)
========================================================= */
export const addCourse = async (req: Request, res: Response) => {
  try {
    const { name, duration, eligibility, originalFee, discountedFee, brochureUrl, feeStructureUrl, degreeId, specializationId } = req.body;
    const course = await prisma.course.create({
      data: {
        collegeId: req.params.id, 
        name, 
        duration, 
        eligibility, 
        brochureUrl, 
        feeStructureUrl,
        originalFee: Number(originalFee || 0), 
        discountedFee: Number(discountedFee || 0),
        ...(degreeId && { degreeId }),
        ...(specializationId && { specializationId })
      }
    });
    res.json({ success: true, data: course });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { name, duration, eligibility, originalFee, discountedFee, brochureUrl, feeStructureUrl, degreeId, specializationId } = req.body;

    // Pre-emptively sweep the storage for old PDF/Media files if we are uploading new ones
    if (brochureUrl || feeStructureUrl) {
      const oldCourse = await prisma.course.findUnique({ where: { id: req.params.courseId } });
      if (oldCourse) {
        if (brochureUrl && oldCourse.brochureUrl && oldCourse.brochureUrl !== brochureUrl) {
          removeLocalFile(oldCourse.brochureUrl);
        }
        if (feeStructureUrl && oldCourse.feeStructureUrl && oldCourse.feeStructureUrl !== feeStructureUrl) {
          removeLocalFile(oldCourse.feeStructureUrl);
        }
      }
    }

    const course = await prisma.course.update({
      where: { id: req.params.courseId },
      data: {
        name, 
        duration, 
        eligibility,
        originalFee: Number(originalFee || 0), 
        discountedFee: Number(discountedFee || 0),
        degreeId: degreeId || null,
        specializationId: specializationId || null,
        // We only update brochures if they are explicitly passed in the request body (including empty strings for clearing)
        ...(brochureUrl !== undefined && { brochureUrl }),
        ...(feeStructureUrl !== undefined && { feeStructureUrl })
      }
    });
    res.json({ success: true, data: course });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
    if (course?.brochureUrl) removeLocalFile(course.brochureUrl);
    if (course?.feeStructureUrl) removeLocalFile(course.feeStructureUrl);

    await prisma.course.delete({ where: { id: req.params.courseId } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================================================
   GALLERY MODULE (1:Many)
========================================================= */
export const addGallery = async (req: Request, res: Response) => {
  try {
    const { imageUrl, caption } = req.body;
    const gal = await prisma.galleryImage.create({ data: { collegeId: req.params.id, imageUrl, caption } });
    res.json({ success: true, data: gal });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteGallery = async (req: Request, res: Response) => {
  try {
    const gal = await prisma.galleryImage.findUnique({ where: { id: req.params.galleryId } });
    if (gal?.imageUrl) removeLocalFile(gal.imageUrl);

    await prisma.galleryImage.delete({ where: { id: req.params.galleryId } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================================================
   ACCREDITATION MODULE (DYNAMIC KEY-VALUE)
========================================================= */
export const addAccreditation = async (req: Request, res: Response) => {
  try {
    const { label, value } = req.body;
    const acc = await prisma.accreditation.create({
      data: { collegeId: req.params.id, label, value }
    });
    res.json({ success: true, data: acc });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAccreditation = async (req: Request, res: Response) => {
  try {
    await prisma.accreditation.delete({ where: { id: req.params.accId } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================================================
   DEADLINE MODULE (TIME-SENSITIVE EVENTS)
========================================================= */
export const addDeadline = async (req: Request, res: Response) => {
  try {
    const { event, date } = req.body;
    const deadline = await prisma.deadline.create({
      data: { collegeId: req.params.id, event, date: new Date(date) }
    });
    res.json({ success: true, data: deadline });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteDeadline = async (req: Request, res: Response) => {
  try {
    await prisma.deadline.delete({ where: { id: req.params.deadlineId } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================================================
   FAQ MODULE (DYNAMIC Q&A)
========================================================= */
export const addFAQ = async (req: Request, res: Response) => {
  try {
    const { question, answer } = req.body;
    const faq = await prisma.faq.create({
      data: { collegeId: req.params.id, question, answer }
    });
    res.json({ success: true, data: faq });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteFAQ = async (req: Request, res: Response) => {
  try {
    await prisma.faq.delete({ where: { id: req.params.faqId } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
