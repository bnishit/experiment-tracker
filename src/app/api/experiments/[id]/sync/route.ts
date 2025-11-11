import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { growthbookAPI } from "@/lib/growthbook-api";

/**
 * Force refresh GrowthBook data for experiment
 * POST /api/experiments/:id/sync
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch experiment
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

    if (!experiment.growthbookFeatureId) {
      return NextResponse.json(
        { error: "Experiment is not linked to GrowthBook" },
        { status: 400 }
      );
    }

    if (!growthbookAPI.isConfigured()) {
      return NextResponse.json(
        { error: "GrowthBook API is not configured" },
        { status: 503 }
      );
    }

    // Fetch fresh data from GrowthBook
    const feature = await growthbookAPI.getFeature(
      experiment.growthbookFeatureId
    );

    if (!feature) {
      return NextResponse.json(
        { error: "Feature not found in GrowthBook" },
        { status: 404 }
      );
    }

    // Update cache timestamp
    await db.experiment.update({
      where: { id },
      data: { lastSyncedAt: new Date() },
    });

    // Return enriched data
    const envStatus = growthbookAPI.getEnvironmentStatus(feature);
    const experiments = growthbookAPI.extractExperiments(feature);
    const targetingSummary = growthbookAPI.getTargetingSummary(feature);

    const growthbookData = {
      featureId: feature.id,
      key: feature.key,
      valueType: feature.valueType,
      defaultValue: feature.defaultValue,
      description: feature.description,
      enabled: envStatus.enabled,
      tags: feature.tags,
      rules: feature.environments.production?.rules || [],
      experiments,
      targetingSummary,
      hasExperiments: envStatus.hasExperiments,
      hasRollouts: envStatus.hasRollouts,
      hasOverrides: envStatus.hasOverrides,
      ruleCount: envStatus.ruleCount,
      revision: feature.revision,
    };

    return NextResponse.json({
      success: true,
      lastSyncedAt: new Date(),
      growthbook: growthbookData,
    });
  } catch (error) {
    console.error("Error syncing with GrowthBook:", error);
    return NextResponse.json(
      {
        error: "Failed to sync with GrowthBook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
