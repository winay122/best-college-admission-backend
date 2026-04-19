import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getChatHistory = async (req: Request, res: Response) => {
  const { phone } = req.params;

  try {
    const messages = await prisma.chatMessage.findMany({
      where: { leadPhone: phone },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getChatInbox = async (req: Request, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        chatMessages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error('Error fetching chat inbox:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const syncLeadProfile = async (req: Request, res: Response) => {
  const { phone, name } = req.body;

  try {
    // Upsert Lead (Create if not exists, Update if exists)
    const lead = await prisma.lead.upsert({
      where: { phone },
      update: { studentName: name },
      create: {
        phone,
        studentName: name,
        interestedStream: 'GENERAL',
        highSchoolPercent: 0,
      },
    });

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error('Error syncing lead profile:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
