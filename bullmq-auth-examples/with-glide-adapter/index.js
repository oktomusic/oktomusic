const { Queue, Worker } = require('bullmq');
const { default: Redis } = require('valkey-glide-ioredis-adapter');

console.log('=== BullMQ with valkey-glide-ioredis-adapter Example ===\n');

async function main() {
  // Create Redis connection using valkey-glide-ioredis-adapter
  const connection = new Redis({
    host: 'localhost',
    port: 6379,
    password: 'oktomusic',
    maxRetriesPerRequest: null,
  });

  console.log('Redis connection created with authentication\n');

  // Create a queue
  const queue = new Queue('test-queue', {
    connection,
  });

  console.log('Queue created\n');

  // Create a worker (this will cause BullMQ to call duplicate() on the connection)
  const worker = new Worker(
    'test-queue',
    async (job) => {
      console.log(`Processing job ${job.id}:`, job.data);
      return { processed: true };
    },
    {
      connection,
    }
  );

  console.log('Worker created - BullMQ will now duplicate the connection for blocking operations\n');
  console.log('Expected behavior: Authentication errors will appear because duplicate() does not inherit credentials\n');

  // Add a job to the queue
  await queue.add('test-job', { message: 'Hello World' });
  console.log('Job added to queue\n');

  // Wait for job to be processed
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log('\nClosing connections...');
  await worker.close();
  await queue.close();
  console.log('Done.');
  process.exit(0);
}

main().catch(console.error);
