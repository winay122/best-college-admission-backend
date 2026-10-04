import { Request, Response } from 'express';
import prisma from '../config/db.js';

// Create a new inquiry (Public Facing)
export const createInquiry = async (req: Request, res: Response) => {
  try {
    const { studentName, phone, email, highSchoolPercent, interestedStream, collegeId } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required.' });
    }

    // Map general inquiry strings or empty values to null
    const resolvedCollegeId = collegeId && collegeId !== 'GLOBAL_CENTER' && collegeId !== '00000000-0000-0000-0000-000000000000' ? collegeId : null;

    // Use transaction to ensure Lead and Enquiry are created together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or Update Lead based on phone number
      const lead = await tx.lead.upsert({
        where: { phone },
        update: {
          studentName: studentName || 'Interested Student',
          email: email || null,
          highSchoolPercent: highSchoolPercent ? Number(highSchoolPercent) : 0,
          interestedStream: interestedStream || 'General',
        },
        create: {
          phone,
          studentName: studentName || 'Interested Student',
          email: email || null,
          highSchoolPercent: highSchoolPercent ? Number(highSchoolPercent) : 0,
          interestedStream: interestedStream || 'General',
        },
      });

      // 2. Create the Enquiry linked to this Lead (optional College link)
      const enquiry = await tx.enquiry.create({
        data: {
          leadPhone: lead.phone,
          collegeId: resolvedCollegeId,
          status: 'PENDING',
        },
      });

      return { lead, enquiry };
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error creating inquiry:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all lead inquiries populated with Student and College specifics
export const getInquiries = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const status = req.query.status as any;
    const collegeId = req.query.collegeId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const all = req.query.all === 'true'; // For export without pagination

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status) where.status = status;
    if (collegeId) where.collegeId = collegeId;

    // Date Range Filtering
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        // Set to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }
    
    if (search) {
      where.OR = [
        { leadPhone: { contains: search, mode: 'insensitive' } },
        { lead: { studentName: { contains: search, mode: 'insensitive' } } },
        { lead: { email: { contains: search, mode: 'insensitive' } } },
        { college: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [inquiries, totalCount] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        include: {
          lead: true,
          college: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' },
        ...(all ? {} : { skip, take: limit })
      }),
      prisma.enquiry.count({ where })
    ]);

    res.json({ 
      success: true, 
      data: inquiries,
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error: any) {
    console.error("Fetch Inquiries Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Staff updating the status of a specific student inquiry (e.g. CALLED, INTERESTED)
export const updateInquiryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const inquiry = await prisma.enquiry.update({
      where: { id },
      data: { status }
    });
    
    res.json({ success: true, data: inquiry });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
