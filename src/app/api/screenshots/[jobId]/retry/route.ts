import { NextRequest, NextResponse } from "next/server";
import { getServerRuntime } from "@/server/runtime";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const { queue, drainQueue } = await getServerRuntime();

  const ok = queue.retry(jobId);

  if (!ok) {
    return NextResponse.json(
      { error: "Job not found or not in failed state" },
      { status: 400 },
    );
  }

  void drainQueue();

  return NextResponse.json({ jobId, status: "queued" });
}