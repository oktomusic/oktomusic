import { Injectable, OnApplicationShutdown, Logger } from "@nestjs/common";
import { GlideClient } from "@valkey/valkey-glide";

@Injectable()
export class ValkeyService implements OnApplicationShutdown {
  private readonly logger = new Logger(ValkeyService.name);

  constructor(private readonly client: GlideClient) {}

  getClient(): GlideClient {
    return this.client;
  }

  onApplicationShutdown() {
    try {
      this.client.close();
    } catch (err) {
      this.logger.error("Failed to close Valkey Glide client", err as Error);
    }
  }
}
