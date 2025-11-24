import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue, Job } from "bullmq";

@Injectable()
export class BullmqService {
  constructor(
    @InjectQueue("library-indexing")
    private readonly indexingQueue: Queue,
  ) {}

  async triggerIndexing(): Promise<Job> {
    const job = await this.indexingQueue.add("index", {});
    return job;
  }

  async getJobStatus(jobId: string): Promise<Job | undefined> {
    const job = await this.indexingQueue.getJob(jobId);
    return job ?? undefined;
  }
}
