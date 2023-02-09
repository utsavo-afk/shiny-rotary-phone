import { Queue } from 'bullmq';

const EmailQueue = new Queue('email');

// we can call this funciton in any gql resolver and add email job
export async function addSendEmailJob(jobName, jobData) {
  return await EmailQueue.add(jobName, jobData);
}
