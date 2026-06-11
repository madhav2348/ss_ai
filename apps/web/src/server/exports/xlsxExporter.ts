import type { ScreenshotAnalysis } from "@ss-ai/types";

export class XlsxExporter {
  async export(records: ScreenshotAnalysis[]): Promise<Buffer> {
    const lines = [
      "id,sourceType,filePath,categories,sourceName,processedAt",
      ...records.map((record) =>
        [
          record.screenshot.id,
          record.screenshot.sourceType,
          JSON.stringify(record.screenshot.filePath),
          JSON.stringify(record.tagging.categories.join("|")),
          JSON.stringify(record.source.sourceName ?? ""),
          record.processedAt,
        ].join(","),
      ),
    ];

    return Buffer.from(lines.join("\n"), "utf8");
  }
}
