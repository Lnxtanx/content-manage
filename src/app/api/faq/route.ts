import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: [
        { created_at: 'desc' }, // newest first
      ],
    });
    
    // Sort manually by answer status (null answers first)
    const sortedFaqs = [...faqs].sort((a, b) => {
      if (!a.answer && b.answer) return -1; // a is pending, b is answered
      if (a.answer && !b.answer) return 1;  // a is answered, b is pending
      return 0;
    });
    
    return NextResponse.json(sortedFaqs);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.question || typeof body.question !== 'string') {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }
    
    const newFaq = await prisma.faq.create({
      data: {
        question: body.question,
        created_at: new Date(),
      },
    });
    
    return NextResponse.json(newFaq, { status: 201 });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
