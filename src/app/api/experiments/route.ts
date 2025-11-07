import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get("platform");
    const userGroup = searchParams.get("userGroup");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    const where: Prisma.ExperimentWhereInput = {};

    if (platform) {
      where.platforms = { has: platform };
    }

    if (userGroup) {
      where.userGroup = userGroup;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { expParameter: { contains: search, mode: "insensitive" } },
      ];
    }

    const experiments = await db.experiment.findMany({
      where,
      include: {
        versions: {
          orderBy: { changeDate: "desc" },
        },
      },
      orderBy: { liveDate: "desc" },
    });

    return NextResponse.json(experiments);
  } catch (error) {
    console.error("Error fetching experiments:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch experiments", details: process.env.NODE_ENV === "development" ? errorMessage : undefined },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      expParameter,
      userGroup,
      numbersList,
      liveDate,
      platforms,
      context,
      isActive,
    } = body;

    if (!name || !expParameter || !userGroup || !liveDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const experiment = await db.experiment.create({
      data: {
        name,
        expParameter,
        userGroup,
        numbersList: numbersList || [],
        liveDate: new Date(liveDate),
        platforms: platforms || [],
        context: context || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        versions: true,
      },
    });

    return NextResponse.json(experiment, { status: 201 });
  } catch (error) {
    console.error("Error creating experiment:", error);
    return NextResponse.json(
      { error: "Failed to create experiment" },
      { status: 500 }
    );
  }
}

