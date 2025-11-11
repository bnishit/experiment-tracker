import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { growthbookAPI } from "@/lib/growthbook-api";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

    // Enrich with GrowthBook data if linked and API is configured
    let growthbookData = null;

    if (experiment.growthbookFeatureId && growthbookAPI.isConfigured()) {
      // Check if cache is fresh (< 5 minutes)
      const cacheAge = experiment.lastSyncedAt
        ? Date.now() - experiment.lastSyncedAt.getTime()
        : Infinity;

      if (cacheAge > CACHE_TTL) {
        try {
          const feature = await growthbookAPI.getFeature(
            experiment.growthbookFeatureId
          );

          if (feature) {
            const envStatus = growthbookAPI.getEnvironmentStatus(feature);
            const experiments = growthbookAPI.extractExperiments(feature);
            const targetingSummary = growthbookAPI.getTargetingSummary(feature);

            growthbookData = {
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

            // Update cache timestamp
            await db.experiment.update({
              where: { id },
              data: { lastSyncedAt: new Date() },
            });
          }
        } catch (error) {
          console.error("GrowthBook API error:", error);
          // Continue without GrowthBook data - graceful degradation
          growthbookData = {
            error: "Failed to fetch from GrowthBook",
            message:
              error instanceof Error ? error.message : "Unknown error",
          };
        }
      }
    }

    return NextResponse.json({
      ...experiment,
      growthbook: growthbookData,
    });
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
      owner,
      tags,
      growthbookFeatureId,
      growthbookProjectId,
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
    if (owner !== undefined) updateData.owner = owner;
    if (tags !== undefined) updateData.tags = tags;
    if (growthbookFeatureId !== undefined)
      updateData.growthbookFeatureId = growthbookFeatureId;
    if (growthbookProjectId !== undefined)
      updateData.growthbookProjectId = growthbookProjectId;

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

