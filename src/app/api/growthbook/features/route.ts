import { NextRequest, NextResponse } from "next/server";
import { growthbookAPI } from "@/lib/growthbook-api";
import { db } from "@/lib/db";

/**
 * Search GrowthBook features
 * GET /api/growthbook/features?search=<term>
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const projectId = searchParams.get("projectId") || undefined;

    if (!growthbookAPI.isConfigured()) {
      return NextResponse.json(
        { error: "GrowthBook API is not configured" },
        { status: 503 }
      );
    }

    // Search features in GrowthBook
    const features = await growthbookAPI.searchFeatures(search, projectId);

    // Check which features are already linked in our database
    const linkedFeatureIds = await db.experiment.findMany({
      where: {
        growthbookFeatureId: { not: null },
      },
      select: {
        growthbookFeatureId: true,
        id: true,
        name: true,
      },
    });

    const linkedMap = new Map(
      linkedFeatureIds
        .filter((e) => e.growthbookFeatureId)
        .map((e) => [
          e.growthbookFeatureId!,
          { experimentId: e.id, experimentName: e.name },
        ])
    );

    // Enrich features with link status
    const enrichedFeatures = features.map((feature) => {
      const envStatus = growthbookAPI.getEnvironmentStatus(feature);
      const linkedTo = linkedMap.get(feature.id);

      return {
        id: feature.id,
        key: feature.key,
        valueType: feature.valueType,
        defaultValue: feature.defaultValue,
        description: feature.description,
        enabled: envStatus.enabled,
        tags: feature.tags,
        hasExperiments: envStatus.hasExperiments,
        hasRollouts: envStatus.hasRollouts,
        ruleCount: envStatus.ruleCount,
        alreadyLinked: !!linkedTo,
        linkedTo: linkedTo || null,
      };
    });

    return NextResponse.json({
      features: enrichedFeatures,
      count: enrichedFeatures.length,
    });
  } catch (error) {
    console.error("Error searching GrowthBook features:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch features from GrowthBook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
