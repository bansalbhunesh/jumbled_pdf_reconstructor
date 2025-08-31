import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { StatusBadge, ProgressBar, LoadingSpinner, Notification, ArtifactCard } from '../../components';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Job = {
  id: string;
  status: 'queued'|'running'|'succeeded'|'failed';
  progress: number;
  error?: string;
  files?: string[];
  mainOutput?: string;
};

export default function JobPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let t: any;
    const tick = async () => {
      try {
        const res = await fetch(`${API}/jobs/${id}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setJob(data);
        setLoading(false);
        if (data.status === 'succeeded' || data.status === 'failed') return;
        t = setTimeout(tick, 1500);
      } catch {
        setLoading(false);
        t = setTimeout(tick, 2000);
      }
    };
    tick();
    return () => t && clearTimeout(t);
  }, [id]);

  const getProgressVariant = (status: string) => {
    switch (status) {
      case 'queued': return 'warning';
      case 'running': return 'default';
      case 'succeeded': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  if (!id) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" color="blue" className="mx-auto mb-4" />
        <p className="text-gray-600">Loading job...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PDF Reconstruction Job
          </h1>
          <p className="text-lg text-gray-600">
            Job ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{id}</span>
          </p>
        </div>

        {/* Main Job Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {loading ? (
            <div className="text-center py-12">
              <LoadingSpinner size="xl" color="blue" className="mx-auto mb-4" />
              <p className="text-gray-600">Fetching job details...</p>
            </div>
          ) : job ? (
            <>
              {/* Status Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">Status</h2>
                  <StatusBadge status={job.status} />
                </div>
                
                {/* Progress Bar */}
                <ProgressBar 
                  progress={job.progress} 
                  variant={getProgressVariant(job.status)}
                  size="lg"
                  className="mb-4"
                />

                {/* Status Messages */}
                {job.status === 'queued' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      Your PDF is queued for processing. This usually takes a few moments to start.
                    </p>
                  </div>
                )}
                
                {job.status === 'running' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      Your PDF is being processed. This may take several minutes depending on the file size and complexity.
                    </p>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {job.error && (
                <Notification
                  type="error"
                  title="Processing Error"
                  message={job.error}
                  className="mb-8"
                />
              )}

              {/* Results Section */}
              {job.status === 'succeeded' && job.files && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Results</h2>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800">
                      🎉 Your PDF has been successfully reconstructed! Download the results below.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {job.files.map((fileName, index) => (
                      <ArtifactCard
                        key={fileName}
                        name={fileName}
                        href={`${API}/jobs/${id}/files/${encodeURIComponent(fileName)}`}
                        isMainOutput={fileName === job.mainOutput || (fileName.endsWith('.pdf') && index === 0)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Processing Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Processing Information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Job ID: <span className="font-mono">{id}</span></p>
                  <p>• Status: <span className="capitalize">{job.status}</span></p>
                  <p>• Progress: {job.progress}%</p>
                  {job.files && <p>• Output files: {job.files.length}</p>}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Job Not Found</h3>
              <p className="text-gray-600">The requested job could not be found or accessed.</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="text-center">
          <a 
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Upload
          </a>
        </div>
      </div>
    </div>
  );
}
