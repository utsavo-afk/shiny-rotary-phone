// will need to run this in another nodejs process
import { Worker } from 'bullmq';

const worker = new Worker('email', processor);

async function processor(job) {
  console.log(job.data);
}

worker.on('completed', (job) => {
  console.info(`${job.id} is completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`${job?.id} has failed with ${err.message}`);
});
