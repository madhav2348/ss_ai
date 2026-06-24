import fs from "node:fs/promises";
import path from "node:path";

export class FilesystemStorage {
  constructor(private readonly baseDir: string) {}

  async ensure(): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
  }

  async saveJson(relativePath: string, data: unknown): Promise<string> {
   const target = path.resolve(this.baseDir, relativePath);

if (!target.startsWith(path.resolve(this.baseDir))) {
  throw new Error("Invalid path");
}
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, JSON.stringify(data, null, 2), "utf8");
    return target;
  }
}
