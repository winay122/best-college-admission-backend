import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Helper for percentage change
    const getChangeStr = (current: number, previous: number, reverseColors = false) => {
      if (previous === 0) {
        const val = current > 0 ? 100 : 0;
        return {
          change: val > 0 ? `+${val}%` : `0%`,
          changeType: val === 0 ? 'positive' : (reverseColors ? 'negative' : 'positive')
        };
      }
      const diff = current - previous;
      const percentage = (diff / previous) * 100;
      const sign = percentage > 0 ? '+' : '';
      
      let changeType = percentage >= 0 ? 'positive' : 'negative';
      if (reverseColors) {
        changeType = percentage > 0 ? 'negative' : 'positive';
      }

      return {
        change: `${sign}${percentage.toFixed(1)}%`,
        changeType
      };
    };

    // 1. Total Inquiries
    const totalInquiries = await prisma.enquiry.count();
    const currentInquiries = await prisma.enquiry.count({ where: { createdAt: { gte: thirtyDaysAgo } } });
    const prevInquiries = await prisma.enquiry.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } });
    const inquiriesChange = getChangeStr(currentInquiries, prevInquiries);

    // 2. Active Colleges
    const activeColleges = await prisma.college.count({ where: { status: 'PUBLISHED' } });
    const newColleges = await prisma.college.count({ where: { status: 'PUBLISHED', createdAt: { gte: thirtyDaysAgo } } });
    // For colleges, let's just show absolute new additions
    const collegesChange = {
      change: `+${newColleges}`,
      changeType: 'positive'
    };

    // 3. Pending Calls
    const pendingCalls = await prisma.enquiry.count({ where: { status: 'PENDING' } });
    const currentPending = await prisma.enquiry.count({ where: { status: 'PENDING', createdAt: { gte: thirtyDaysAgo } } });
    const prevPending = await prisma.enquiry.count({ where: { status: 'PENDING', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } });
    // Fewer pending calls is good, so reverse colors
    const pendingChange = getChangeStr(currentPending, prevPending, true);

    // 4. Conversion Rate
    const admittedCount = await prisma.enquiry.count({ where: { status: 'ADMITTED' } });
    const conversionRate = totalInquiries > 0 ? ((admittedCount / totalInquiries) * 100).toFixed(1) : '0.0';

    const currentAdmitted = await prisma.enquiry.count({ where: { status: 'ADMITTED', createdAt: { gte: thirtyDaysAgo } } });
    const prevAdmitted = await prisma.enquiry.count({ where: { status: 'ADMITTED', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } });
    
    const currentConv = currentInquiries > 0 ? (currentAdmitted / currentInquiries) * 100 : 0;
    const prevConv = prevInquiries > 0 ? (prevAdmitted / prevInquiries) * 100 : 0;
    
    const diffConv = currentConv - prevConv;
    const convChange = {
      change: `${diffConv > 0 ? '+' : ''}${diffConv.toFixed(1)}%`,
      changeType: diffConv >= 0 ? 'positive' : 'negative'
    };

    res.status(200).json({
      success: true,
      data: {
        totalInquiries: { value: totalInquiries.toString(), change: inquiriesChange.change, changeType: inquiriesChange.changeType },
        activeColleges: { value: activeColleges.toString(), change: collegesChange.change, changeType: collegesChange.changeType },
        pendingCalls: { value: pendingCalls.toString(), change: pendingChange.change, changeType: pendingChange.changeType },
        conversionRate: { value: `${conversionRate}%`, change: convChange.change, changeType: convChange.changeType },
      }
    });

  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
