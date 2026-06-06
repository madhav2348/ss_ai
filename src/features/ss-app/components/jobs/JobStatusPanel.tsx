import { useCallback, useEffect, useRef, useState } from 'react'

export type JobStatus = 'queued' | 'processing' | 'processed' | 'failed'

export type PipelineStage =
  | 'ocr'
  | 'vision'
  | 'source'
  | 'tagging'
  | 'storing'
  | null

export type JobRecord = {
  jobId: string
  status: JobStatus
  stage: PipelineStage
  error: string | null
  createdAt: string
  updatedAt: string
}

const STAGE_LABELS: Record<NonNullable<PipelineStage>, string> = {
  ocr: 'Reading text (OCR)',
  vision: 'Analysing image',
  source: 'Finding source',
  tagging: 'Tagging',
  storing: 'Storing result',
}

const POLL_ACTIVE_MS = 3000
const POLL_IDLE_MS = 15000

async function fetchJobs(): Promise<JobRecord[]> {
  const res = await fetch('/api/screenshots')
  if (!res.ok) throw new Error('Failed to fetch jobs')
  const raw = (await res.json()) as Array<{
    id: string
    status: JobStatus
    stage: PipelineStage
    error?: string | null
    createdAt: string
    updatedAt: string
  }>
  return raw.map((j) => ({
    jobId: j.id,
    status: j.status,
    stage: j.stage ?? null,
    error: j.error ?? null,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
  }))
}

async function retryJob(jobId: string): Promise<void> {
  await fetch(`/api/screenshots/${jobId}/retry`, { method: 'POST' })
}

export function JobStatusPanel() {
  const [jobs, setJobs] = useState<JobRecord[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const poll = useCallback(async () => {
    try {
      const all = await fetchJobs()
      setJobs(all)
      setFetchError(null)

      const hasActive = all.some(
        (j) => j.status === 'queued' || j.status === 'processing',
      )
      timerRef.current = setTimeout(
        poll,
        hasActive ? POLL_ACTIVE_MS : POLL_IDLE_MS,
      )
    } catch {
      setFetchError('Could not load job status.')
      timerRef.current = setTimeout(poll, POLL_IDLE_MS)
    }
  }, [])

  useEffect(() => {
    void poll()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [poll])

  if (jobs.length === 0 && !fetchError) return null

  return (
    <div className="job-status-panel">
      <p className="eyebrow">Ingestion queue</p>

      {fetchError ? (
        <p className="status-message error">{fetchError}</p>
      ) : null}

      <div className="job-list">
        {jobs.map((job) => (
          <JobRow
            key={job.jobId}
            job={job}
            onRetry={async () => {
              await retryJob(job.jobId)
              void poll()
            }}
          />
        ))}
      </div>
    </div>
  )
}

function JobRow({
  job,
  onRetry,
}: {
  job: JobRecord
  onRetry: () => void
}) {
  return (
    <div className={`job-row job-row--${job.status}`}>
      <div className="job-indicator">
        {job.status === 'queued' && (
          <span className="job-spinner" aria-label="Queued" />
        )}
        {job.status === 'processing' && (
          <span
            className="job-spinner job-spinner--active"
            aria-label="Processing"
          />
        )}
        {job.status === 'processed' && (
          <span className="job-check" aria-label="Done">
            ✓
          </span>
        )}
        {job.status === 'failed' && (
          <span className="job-fail" aria-label="Failed">
            ✕
          </span>
        )}
      </div>

      <div className="job-body">
        <span className="job-id">{job.jobId.slice(0, 20)}…</span>

        {job.status === 'queued' && (
          <span className="job-label">Waiting…</span>
        )}
        {job.status === 'processing' && job.stage && (
          <span className="job-label job-label--active">
            {STAGE_LABELS[job.stage]}
          </span>
        )}
        {job.status === 'processed' && (
          <span className="job-label job-label--done">Complete</span>
        )}
        {job.status === 'failed' && (
          <span className="job-label job-label--error">
            {job.error ?? 'Processing failed'}
          </span>
        )}

        <span className="job-time">
          {new Date(job.updatedAt).toLocaleTimeString()}
        </span>
      </div>

      {job.status === 'failed' && (
        <button type="button" className="job-retry-btn" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}