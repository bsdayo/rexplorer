export type AppThemeName = 'light' | 'dark'

export interface RcloneInfo {
  addr: string
  user: string
  pass: string
}

export interface RcloneDirent {
  Path: string
  Name: string
  Size: number
  MimeType: string
  ModTime: string
  IsDir: boolean
}

export interface RcloneJob {
  status: RcloneJobStatus
  stats: RcloneStats
}

export interface RcloneJobMeta {
  id: number
  type: 'upload' | 'download'
  remote: string
  pathStr: string
  name: string
}

export interface RcloneJobStatus {
  finished: boolean
  duration: number
  endTime: string
  error: string
  id: number
  startTime: string
  success: boolean
  output: any
}

// https://rclone.org/rc/#core-stats
export interface RcloneStats {
  bytes: number
  checks: number
  deletes: number
  elapsedTime: number
  errors: number
  eta: number
  fatalError: boolean
  lastError: string
  renames: number
  listed: number
  retryError: boolean
  serverSideCopies: number
  serverSideCopyBytes: number
  serverSideMoves: number
  serverSideMoveBytes: number
  speed: number
  totalBytes: number
  totalChecks: number
  totalTransfers: number
  transferTime: number
  transfers: number
  transferring: RcloneStatsTransferring[]
  checking: string[]
}

export interface RcloneStatsTransferring {
  bytes: number
  eta: number
  name: string
  percentage: number
  speed: number
  speedAvg: number
  size: number
}
