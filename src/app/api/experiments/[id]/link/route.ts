import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { growthbookAPI } from "@/lib/growthbook-api";

/**
 * Link experiment to GrowthBook feature
 * POST /api/experiments/:id/link
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { growthbookFeatureId } = body;

    if (!growthbookFeatureId) {
      return NextResponse.json(
        { error: "growthbookFeatureId is required" },
        { status: 400 }
      );
    }

    if (!growthbookAPI.isConfigured()) {
      return NextResponse.json(
        { error: "GrowthBook API is not configured" },
        { status: 503 }
      );
    }

    // Verify feature exists in GrowthBook
    const feature = await growthbookAPI.getFeature(growthbookFeatureId);

    if (!feature) {
      return NextResponse.json(
        { error: "Feature not found in GrowthBook" },
        { status: 404 }
      );
    }

    // Update experiment with GrowthBook link
    const experiment = await db.experiment.update({
      where: { id },
      data: {
        growthbookFeatureId,
        lastSyncedAt: new Date(),
      },
      include: {
        versions: {
          orderBy: { changeDate: "desc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      experiment,
      feature: {
        key: feature.key,
        enabled: feature.environments.production?.enabled || false,
        valueType: feature.valueType,
      },
    });
  } catch (error) {
    console.error("Error linking to GrowthBook:", error);
    return NextResponse.json(
      {
        error: "Failed to link to GrowthBook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Unlink experiment from GrowthBook feature
 * DELETE /api/experiments/:id/link
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const experiment = await db.experiment.update({
      where: { id },
      data: {
        growthbookFeatureId: null,
        lastSyncedAt: null,
      },
      include: {
        versions: {
          orderBy: { changeDate: "desc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      experiment,
    });
  } catch (error) {
    console.error("Error unlinking from GrowthBook:", error);
    return NextResponse.json(
      { error: "Failed to unlink from GrowthBook" },
      { status: 500 }
    );
  }
}
