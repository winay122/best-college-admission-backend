import { Request, Response } from 'express';
import prisma from '../config/db.js';

// Get all lead inquiries populated with Student and College specifics
export const getInquiries = async (req: Request, res: Response) => {
  try {
    const inquiries = await prisma.enquiry.findMany({
      include: {
        lead: true,
        college: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: inquiries });
  } catch (error: any) {
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
