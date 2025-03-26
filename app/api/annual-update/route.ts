import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

const prisma = new PrismaClient();


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }
    
  
    const currentYear = new Date().getFullYear();
    

    const existingRequest = await prisma.annualInfoUpdateRequest.findFirst({
      where: {
        year: currentYear,
      },
    });
    
    if (existingRequest) {
      return NextResponse.json(
        { 
          error: "Annual update request for this year already exists",
          existingRequest,
        },
        { status: 409 }
      );
    }
    
 
    const updateRequest = await prisma.annualInfoUpdateRequest.create({
      data: {
        year: currentYear,
        sentAt: new Date(),
      },
    });
    
   
    const activeUsers = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: string;
        name: string;
        email: string;
      },
    });
    
    
    const emailPromises = activeUsers.map(user => {
      const updateToken = Buffer.from(`${user.id}:${currentYear}:${Date.now()}`).toString('base64');
      const updateUrl = `${process.env.NEXT_PUBLIC_APP_URL}/annual-update?token=${updateToken}`;
      
      return sendEmail({
        to: user.email,
        subject: `Annual Information Update Request ${currentYear}`,
        text: `Hello ${user.name},\n\nIt's time for our annual information update. Please review and update your information by clicking the link below:\n\n${updateUrl}\n\nIf you have any questions, please contact our support team.\n\nThank you,\nThe Admin Team`,
        html: `
          <h1>Annual Information Update</h1>
          <p>Hello ${user.name},</p>
          <p>It's time for our annual information update. Please review and update your information by clicking the button below:</p>
          <p>
            <a href="${updateUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Update My Information
            </a>
          </p>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${updateUrl}">${updateUrl}</a></p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Thank you,<br>The Admin Team</p>
        `,
      });
    });
    
    await Promise.all(emailPromises);
    
    return NextResponse.json({
      message: `Annual update request created and emails sent to ${activeUsers.length} users`,
      updateRequest,
    });
  } catch (error) {
    console.error("Error creating annual update request:", error);
    return NextResponse.json(
      { error: "Failed to process annual update request" },
      { status: 500 }
    );
  }
}


export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }
    
   
    const currentYear = new Date().getFullYear();
    
    
    const updateRequests = await prisma.annualInfoUpdateRequest.findMany({
      where: {
        year: currentYear,
      },
      orderBy: {
        sentAt: 'desc',
      },
    });
    
    const usersWithUpdates = await prisma.user.count({
      where: {
        isActive: true,
        lastInfoUpdate: {
          gte: new Date(currentYear, 0, 1),
        },
      },
    });
    
    const totalActiveUsers = await prisma.user.count({
      where: {
        isActive: true,
      },
    });
    
    return NextResponse.json({
      updateRequests,
      stats: {
        totalActiveUsers,
        usersWithUpdates,
        pendingUpdates: totalActiveUsers - usersWithUpdates,
        completionRate: totalActiveUsers > 0 
          ? Math.round((usersWithUpdates / totalActiveUsers) * 100) 
          : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching annual update requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch annual update requests" },
      { status: 500 }
    );
  }
} 
