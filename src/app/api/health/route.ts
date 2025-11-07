import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test database connection
    await db.$connect();
    const count = await db.experiment.count();
    
    return NextResponse.json({
      status: "ok",
      database: "connected",
      experimentCount: count,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: errorMessage,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) || "not set",
      },
      { status: 500 }
    );
  }
}

