import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { addUserToOrganization } from "@/lib/githubIntegration";

const prisma = new PrismaClient();


const updateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  comments: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;
    

    const body = await request.json();
    const validationResult = updateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { status, comments } = validationResult.data;
    

    const pendingRegistration = await prisma.pendingUserRegistration.findUnique({
      where: { id },
    });
    
    if (!pendingRegistration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }
    

    const updatedRegistration = await prisma.pendingUserRegistration.update({
      where: { id },
      data: {
        status,
        comments,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    });

    if (status === "APPROVED") {
      const newUser = await prisma.user.create({
        data: {
          name: pendingRegistration.name,
          email: pendingRegistration.email,
          username: pendingRegistration.preferredUsername,
          university: pendingRegistration.university,
          githubId: pendingRegistration.githubId,
          role: "MEMBER",
          isActive: true,
        },
      });

      if (pendingRegistration.githubId) {
        try {
          await addUserToOrganization(pendingRegistration.githubId);
        } catch (error) {
          console.error("Failed to add user to GitHub organization:", error);
          // Continue with the process even if GitHub integration fails
        }
      }
      
      await sendEmail({
        to: pendingRegistration.email,
        subject: "Your Registration Has Been Approved",
        text: `Hello ${pendingRegistration.name},\n\nWe're pleased to inform you that your registration has been approved. You can now log in to the system with your credentials.\n\n${comments ? `Comments from admin: ${comments}\n\n` : ""}Welcome aboard!\n\nRegards,\nThe Admin Team`,
        html: `
          <h1>Registration Approved</h1>
          <p>Hello ${pendingRegistration.name},</p>
          <p>We're pleased to inform you that your registration has been approved. You can now log in to the system with your credentials.</p>
          ${comments ? `<p><strong>Comments from admin:</strong> ${comments}</p>` : ""}
          <p>Welcome aboard!</p>
          <p>Regards,<br>The Admin Team</p>
        `,
      });
    } else if (status === "REJECTED") {
      await sendEmail({
        to: pendingRegistration.email,
        subject: "Your Registration Status",
        text: `Hello ${pendingRegistration.name},\n\nWe regret to inform you that your registration request has been declined.\n\n${comments ? `Reason: ${comments}\n\n` : ""}If you believe this was in error or would like more information, please contact our support team.\n\nRegards,\nThe Admin Team`,
        html: `
          <h1>Registration Status</h1>
          <p>Hello ${pendingRegistration.name},</p>
          <p>We regret to inform you that your registration request has been declined.</p>
          ${comments ? `<p><strong>Reason:</strong> ${comments}</p>` : ""}
          <p>If you believe this was in error or would like more information, please contact our support team.</p>
          <p>Regards,<br>The Admin Team</p>
        `,
      });
    }
    
    return NextResponse.json({
      message: `Registration ${status.toLowerCase()} successfully`,
      status,
    });
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { error: "Failed to process registration update" },
      { status: 500 }
    );
  }
} 
