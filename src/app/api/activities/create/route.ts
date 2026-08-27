import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateShareCode } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, description, creatorName, voteType, allowSuggestions,
      customFields, timeOptions, locationOptions,
      imageUrl, feeAmount, feeDescription, feeDeadline,
      locationName, locationAddress, locationLat, locationLng,
      deadline, category,
    } = body;

    const shareCode = generateShareCode();

    const activity = await prisma.activity.create({
      data: {
        title,
        description: description || "",
        creatorName: creatorName || "Organizer",
        voteType: voteType || "single",
        allowSuggestions: allowSuggestions !== false,
        shareCode,
        isPublished: true,
        status: "open",
        deadline: deadline ? new Date(deadline) : null,
        category: category || "other",
        imageUrl: imageUrl || null,
        feeAmount: feeAmount || null,
        feeDescription: feeDescription || null,
        feeDeadline: feeDeadline ? new Date(feeDeadline) : null,
        locationName: locationName || null,
        locationAddress: locationAddress || null,
        locationLat: locationLat || null,
        locationLng: locationLng || null,
        customFields: {
          create: (customFields || []).map((f: any, i: number) => ({
            label: f.label,
            fieldType: f.fieldType || "text",
            required: f.required || false,
            options: f.options ? JSON.stringify(f.options) : null,
            placeholder: f.placeholder || null,
            sortOrder: i,
          })),
        },
        timeOptions: {
          create: (timeOptions || []).map((t: any) => ({
            label: t.label,
            startTime: t.startTime ? new Date(t.startTime) : null,
            endTime: t.endTime ? new Date(t.endTime) : null,
          })),
        },
        locationOptions: {
          create: (locationOptions || []).map((l: any) => ({
            name: l.name,
            address: l.address || null,
            lat: l.lat || null,
            lng: l.lng || null,
          })),
        },
      },
      include: {
        customFields: true,
        timeOptions: true,
        locationOptions: true,
      },
    });

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error("Create activity error:", error);
    return NextResponse.json({ success: false, error: "Failed to create activity" }, { status: 500 });
  }
}