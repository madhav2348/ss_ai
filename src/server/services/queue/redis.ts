export interface RedisQueueConfig {
  url: string;
}

export class RedisQueueClient {
  constructor(private readonly config: RedisQueueConfig) {}

  get url(): string {
    return this.config.url;
  }
}
