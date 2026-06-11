import { getServerRuntime } from "@/server/runtime";

export async function GET() {
  const { pipeline } = await getServerRuntime();
  const exportBuffer = await pipeline.exportRecords();

  return new Response(new Uint8Array(exportBuffer), {
    headers: {
      "content-disposition": 'attachment; filename="screenshots.csv"',
      "content-type": "text/csv; charset=utf-8",
    },
  });
}
