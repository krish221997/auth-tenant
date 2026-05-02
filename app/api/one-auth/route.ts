import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-id",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders },
      );
    }
    const page = req.nextUrl.searchParams.get("page");
    const limit = req.nextUrl.searchParams.get("limit");
    const response = await fetch(
      `https://api.withone.ai/v1/authkit/token?page=${page}&limit=${limit}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-One-Secret": process.env.ONE_SECRET_KEY!,
        },
        body: JSON.stringify({
          identity: userId,
          identityType: "user",
        }),
      },
    );
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to generate token" },
        { status: response.status, headers: corsHeaders },
      );
    }
    const token = await response.json();
    return NextResponse.json(token, { headers: corsHeaders });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500, headers: corsHeaders },
    );
  }
}
