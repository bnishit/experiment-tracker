import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const experiment = await db.experiment.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { changeDate: "desc" },
        },
      },
    });

    if (!experiment) {
      return NextResponse.json(
        { error: "Experiment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(experiment);
  } catch (error) {
    console.error("Error fetching experiment:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const updateData: Prisma.ExperimentUpdateInput = {};

    if (name !== undefined) updateData.name = name;
    if (expParameter !== undefined) updateData.expParameter = expParameter;
    if (userGroup !== undefined) updateData.userGroup = userGroup;
    if (numbersList !== undefined) updateData.numbersList = numbersList;
    if (liveDate !== undefined) updateData.liveDate = new Date(liveDate);
    if (platforms !== undefined) updateData.platforms = platforms;
    if (context !== undefined) updateData.context = context;
    if (isActive !== undefined) updateData.isActive = isActive;

    const experiment = await db.experiment.update({
      where: { id },
      data: updateData,
      include: {
        versions: {
          orderBy: { changeDate: "desc" },
        },
      },
    });

    return NextResponse.json(experiment);
  } catch (error) {
    console.error("Error updating experiment:", error);
    return NextResponse.json(
      { error: "Failed to update experiment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.experiment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting experiment:", error);
    return NextResponse.json(
      { error: "Failed to delete experiment" },
      { status: 500 }
    );
  }
}

