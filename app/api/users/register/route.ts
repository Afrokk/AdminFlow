import { NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "@/lib/email";

const prisma = new PrismaClient();

// Validation schema
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  university: z.string().min(2),
  preferredUsername: z.string().min(3),
  githubId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = userSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { name, email, university, preferredUsername, githubId } = validationResult.data;
    
   
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }
    
    const existingUsername = await prisma.user.findUnique({
      where: { username: preferredUsername },
    });
    
    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken" },
        { status: 409 }
      );
    }

    const pendingUser = await prisma.pendingUserRegistration.create({
      data: {
        name,
        email,
        university,
        preferredUsername,
        githubId,
        status: "PENDING",
        createdAt: new Date(),
      },
    });
    
    await sendEmail({
      to: process.env.ADMIN_EMAIL || "admin@example.com",
      subject: "New User Registration Pending Approval",
      text: `A new user registration from ${name} (${email}) is pending approval. Please log in to the admin dashboard to review.`,
      html: `
        <h1>New User Registration</h1>
        <p>A new user has registered and needs approval:</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>University:</strong> ${university}</li>
          <li><strong>Preferred Username:</strong> ${preferredUsername}</li>
          ${githubId ? `<li><strong>GitHub ID:</strong> ${githubId}</li>` : ''}
        </ul>
        <p>Please log in to the <a href="${process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3000/admin'}">admin dashboard</a> to review this request.</p>
      `,
    });
    
    return NextResponse.json(
      { message: "Registration submitted successfully", id: pendingUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
} 
