import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { removeLocalFile } from '../utils/fileRemover.js';
import { generateSlug } from '../utils/slugger.js';

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

    // Text Search — matches college name, city, state, or any course/degree name
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { city: { contains: String(search), mode: 'insensitive' } },
        { state: { contains: String(search), mode: 'insensitive' } },
        { collegeType: { contains: String(search), mode: 'insensitive' } },
        // Match colleges that have a course whose name contains the search term
        { courses: { some: { name: { contains: String(search), mode: 'insensitive' } } } },
        // Match colleges that have a course whose degree name contains the search term (e.g. "B.Tech", "MBA")
        { courses: { some: { degree: { name: { contains: String(search), mode: 'insensitive' } } } } },
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
          ...((minFee || maxFee) && {
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
        placement: { include: { recruiters: { orderBy: { createdAt: 'asc' } } } },
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
        placement: { include: { recruiters: { orderBy: { createdAt: 'asc' } } } },
        rankings: true,
        galleries: true,
        courses: {
          include: { degree: true, specialization: true }
        },
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

export const getCollegeBySlug = async (req: Request, res: Response) => {
  try {
    const college = await prisma.college.findUnique({
      where: { slug: req.params.slug },
      include: {
        info: true,
        placement: { include: { recruiters: { orderBy: { createdAt: 'asc' } } } },
        rankings: true,
        galleries: true,
        courses: {
          include: { degree: true, specialization: true }
        },
        university: true,
        accreditations: true,
        deadlines: true,
        faqs: true
      }
    });
    
    if (!college) {
      return res.status(404).json({ success: false, error: 'College node not found in index' });
    }
    
    res.json({ success: true, data: college });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createCollege = async (req: Request, res: Response) => {
  try {
    const {
      name, city, state, logoUrl, priorityScore, facilities,
      hostelAvailable, universityId, collegeType, ownershipType, rating,
      seoTitle, seoDescription, seoKeywords, overallBrochureUrl
    } = req.body;

    const college = await prisma.college.create({
      data: {
        name, 
        slug: generateSlug(name),
        city, state, logoUrl,
        priorityScore: Number(priorityScore || 0),
        rating: Number(rating || 0),
        ownershipType,
        facilities: facilities || [],
        hostelAvailable: hostelAvailable || false,
        universityId,
        collegeType,
        seoTitle,
        seoDescription,
        seoKeywords,
        overallBrochureUrl,
        info: { create: { aboutHtml: '', highlightsHtml: '', admissionsHtml: '', scholarshipHtml: '' } },
        placement: { create: { highestPackage: null, averagePackage: null, placementPercent: null } }
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
      hostelAvailable, universityId, collegeType, ownershipType, rating,
      seoTitle, seoDescription, seoKeywords, overallBrochureUrl
    } = req.body;

    if (logoUrl) {
      const old = await prisma.college.findUnique({ where: { id: req.params.id } });
      if (old?.logoUrl && old.logoUrl !== logoUrl) removeLocalFile(old.logoUrl);
    }

    if (overallBrochureUrl) {
      const old = await prisma.college.findUnique({ where: { id: req.params.id } });
      if (old?.overallBrochureUrl && old.overallBrochureUrl !== overallBrochureUrl) removeLocalFile(old.overallBrochureUrl);
    }

    const updated = await prisma.college.update({
      where: { id: req.params.id },
      data: {
        name, 
        slug: name ? generateSlug(name) : undefined,
        city, state, logoUrl,
        priorityScore: priorityScore !== undefined ? Number(priorityScore) : undefined,
        rating: rating !== undefined ? Number(rating) : undefined,
        ownershipType,
        facilities,
        hostelAvailable,
        universityId,
        collegeType,
        seoTitle,
        seoDescription,
        seoKeywords,
        overallBrochureUrl
      }
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteCollege = async (req: Request, res: Response) => {
  try {
    const old = await prisma.college.findUnique({ where: { id: req.params.id } });
    if (old?.logoUrl) removeLocalFile(old.logoUrl);
    if (old?.overallBrochureUrl) removeLocalFile(old.overallBrochureUrl);
    
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
    
    // Upsert: creates CollegeInfo if it doesn't yet exist
    const info = await prisma.collegeInfo.upsert({
      where: { collegeId: req.params.id },
      update: { aboutHtml, highlightsHtml, admissionsHtml, scholarshipHtml },
      create: { collegeId: req.params.id, aboutHtml, highlightsHtml, admissionsHtml, scholarshipHtml },
    });
    res.json({ success: true, data: info });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePlacement = async (req: Request, res: Response) => {
  try {
    const { highestPackage, averagePackage, placementPercent } = req.body;
    
    // Upsert in case no placement record yet exists for this college
    const p = await prisma.placement.upsert({
      where: { collegeId: req.params.id },
      update: { 
        highestPackage: highestPackage !== undefined ? Number(highestPackage) : undefined,
        averagePackage: averagePackage !== undefined ? Number(averagePackage) : undefined,
        placementPercent: placementPercent !== undefined ? Number(placementPercent) : undefined
      },
      create: { 
        collegeId: req.params.id,
        highestPackage: highestPackage ? Number(highestPackage) : null,
        averagePackage: averagePackage ? Number(averagePackage) : null,
        placementPercent: placementPercent ? Number(placementPercent) : null
      },
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

/* =========================================================
   RECRUITER MODULE (HIRING PARTNER)
========================================================= */
export const addRecruiter = async (req: Request, res: Response) => {
  try {
    const { name, logoUrl, website } = req.body;
    
    // Ensure placement record exists
    let placement = await prisma.placement.findUnique({ where: { collegeId: req.params.id } });
    if (!placement) {
      placement = await prisma.placement.create({ data: { collegeId: req.params.id } });
    }
    
    const recruiter = await prisma.recruiter.create({
      data: { placementId: placement.id, name: name.trim(), logoUrl: logoUrl || null, website: website || null }
    });
    res.json({ success: true, data: recruiter });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteRecruiter = async (req: Request, res: Response) => {
  try {
    await prisma.recruiter.delete({ where: { id: req.params.recruiterId } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
