import { Inject, Logger } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

import appConfig from "../../config/definitions/app.config";
import { PrismaService } from "../../db/prisma.service";

@Processor("library_indexing")
export class IndexingProcessor extends WorkerHost {
  private readonly logger = new Logger(IndexingProcessor.name);

  constructor(
    private prisma: PrismaService,
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
  ) {
    super();
  }

  async process(job: Job) {
    // const { filePath } = job.data;
    const libraryPath = this.appConf.libraryPath;

    this.logger.log(`Processing job ${job.id} - libraryPath: ${libraryPath}`);

    // ... hash / prisma update ...

    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.logger.log(`Completed job ${job.id}`);

    return { ok: true };
  }
}
