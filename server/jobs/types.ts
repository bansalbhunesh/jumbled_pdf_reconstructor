export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export interface JobInfo {
  id: string;
  status: JobStatus;
  progress: number; // 0..100
  error?: string;
  files?: string[]; // artifact filenames in the run folder
  mainOutput?: string; // the main reconstructed PDF file
}
