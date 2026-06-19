import http from "node:http";
import type { IScreenshotRepository } from "../database/IScreenshotRepository";
import type { ScreenshotPipeline } from "../services/pipeline/screenshotPipeline";
import type { InMemoryQueue } from "../services/queue/queue";
import type { ScreenshotInput } from "../types/screenshot";

export interface ApiServerDeps {
  pipeline: ScreenshotPipeline;
  repository: IScreenshotRepository;
  queue: InMemoryQueue<ScreenshotInput>;
}

export function createApiServer({ pipeline, repository, queue }: ApiServerDeps) {
  return http.createServer(async (req, res) => {
    if (!req.url) {
      res.writeHead(400).end("Missing url");
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, queueSize: queue.size() }));
      return;
    }

    if (req.method === "GET" && req.url === "/screenshots") {
      const records = await repository.findAll();
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(records, null, 2));
      return;
    }

    if (req.method === "GET" && req.url === "/exports/xlsx") {
      const exportBuffer = await pipeline.exportRecords();
     res.writeHead(200, {
  "content-type":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "content-disposition":
    'attachment; filename="screenshots.xlsx"',
});
      res.end(exportBuffer);
      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });
}
