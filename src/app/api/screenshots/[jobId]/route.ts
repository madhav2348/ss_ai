import { NextRequest, NextResponse } from "next/server";
import { getServerRuntime } from "@/server/runtime";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ jobId: string }>}
) {
    const { jobId } = await params;
    const { queue } = await getServerRuntime();

    const job = queue.getById(jobId);

    if(!job) {
        return NextResponse.json({ error: "Job not found"}, { status: 404 });
    }

    return NextResponse.json({
        jobId: job.id,
        status: "queued",
        createdAt: job.createdAt,
    });
}