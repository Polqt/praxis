import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  integer,
  boolean,
  bigint,
  jsonb,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

// =====================
// ENUMS
// =====================

export const submissionStatusEnum = pgEnum('submission_status', [
  'created',
  'queued',
  'ingesting',
  'ingestion_failed',
  'analyzing',
  'analysis_failed',
  'generating_report',
  'report_generation_failed',
  'verified',
  'insufficient',
  'failed',
  'expired',
  'cancelled',
])

export const projectTypeEnum = pgEnum('project_type', [
  'backend',
  'frontend',
])

export const challengeDifficultyEnum = pgEnum('challenge_difficulty', [
  'beginner',
  'intermediate',
  'advanced',
])

export const verdictEnum = pgEnum('verdict', [
  'verified',
  'insufficient',
  'failed',
])

export const sourceTypeEnum = pgEnum('source_type', [
  'project',
])

// =====================
// TABLES
// =====================

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  supabaseUid: text('supabase_uid').unique().notNull(),
  email: text('email').notNull(),
  username: text('username').unique(),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tracks = pgTable('tracks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  slug: text('slug').unique().notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const skills = pgTable('skills', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  trackId: text('track_id').notNull().references(() => tracks.id),
  name: text('name').unique().notNull(),
  category: text('category').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const userSkills = pgTable('user_skills', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  skillId: text('skill_id').notNull().references(() => skills.id),
  sourceType: sourceTypeEnum('source_type').notNull(),
  awardedAt: timestamp('awarded_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('user_skills_user_id_skill_id_idx').on(t.userId, t.skillId),
])

export const projectChallenges = pgTable('project_challenges', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  trackId: text('track_id').notNull().references(() => tracks.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  projectType: projectTypeEnum('project_type').notNull(),
  difficulty: challengeDifficultyEnum('difficulty').notNull().default('intermediate'),
  rubric: jsonb('rubric').notNull(),
  passingThreshold: integer('passing_threshold').notNull().default(70),
  version: integer('version').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const githubAccounts = pgTable('github_accounts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').unique().notNull().references(() => users.id),
  githubUserId: bigint('github_user_id', { mode: 'number' }).unique().notNull(),
  githubUsername: text('github_username').notNull(),
  githubEmail: text('github_email'),
  accessToken: text('access_token').notNull(),
  tokenScope: text('token_scope').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  connectedAt: timestamp('connected_at').defaultNow().notNull(),
  lastSyncedAt: timestamp('last_synced_at'),
})

export const projectSubmissions = pgTable('project_submissions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  challengeId: text('challenge_id').notNull().references(() => projectChallenges.id),
  githubRepoFullName: text('github_repo_full_name').notNull(),
  githubRepoId: bigint('github_repo_id', { mode: 'number' }).notNull(),
  commitSha: text('commit_sha').notNull(),
  status: submissionStatusEnum('status').notNull().default('created'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  ingestedAt: timestamp('ingested_at'),
  analyzedAt: timestamp('analyzed_at'),
  completedAt: timestamp('completed_at'),
  attempts: integer('attempts').notNull().default(1),
  failureReason: text('failure_reason'),
  rubricVersion: integer('rubric_version').notNull(),
  viewedAt: timestamp('viewed_at'),
}, (t) => [
  uniqueIndex('project_submissions_user_challenge_commit_idx').on(
    t.userId, t.challengeId, t.commitSha,
  ),
])

export const projectSubmissionEvents = pgTable('project_submission_events', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  submissionId: text('submission_id').notNull().references(() => projectSubmissions.id),
  fromStatus: submissionStatusEnum('from_status'),
  toStatus: submissionStatusEnum('to_status').notNull(),
  reason: text('reason'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const repositoryIngestions = pgTable('repository_ingestions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  githubRepoId: bigint('github_repo_id', { mode: 'number' }).notNull(),
  commitSha: text('commit_sha').notNull(),
  repoFullName: text('repo_full_name').notNull(),
  ingestedData: jsonb('ingested_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('repository_ingestions_repo_commit_idx').on(t.githubRepoId, t.commitSha),
])

export const repositoryExecutions = pgTable('repository_executions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  repositoryIngestionId: text('repository_ingestion_id').notNull().references(() => repositoryIngestions.id),
  language: text('language').notNull(),
  testCommand: text('test_command').notNull(),
  exitCode: integer('exit_code').notNull(),
  passed: integer('passed').notNull().default(0),
  failed: integer('failed').notNull().default(0),
  skipped: integer('skipped').notNull().default(0),
  durationMs: integer('duration_ms'),
  stdout: text('stdout'),
  stderr: text('stderr'),
  timedOut: boolean('timed_out').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('repository_executions_ingestion_idx').on(t.repositoryIngestionId),
])

export const repositoryAnalyses = pgTable('repository_analyses', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  repositoryIngestionId: text('repository_ingestion_id').notNull().references(() => repositoryIngestions.id),
  analyzerVersion: text('analyzer_version').notNull(),
  analysisData: jsonb('analysis_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('repository_analyses_ingestion_version_idx').on(t.repositoryIngestionId, t.analyzerVersion),
])

export const projectVerificationReports = pgTable('project_verification_reports', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  submissionId: text('submission_id').unique().notNull().references(() => projectSubmissions.id),
  compositeScore: integer('composite_score').notNull(),
  verdict: verdictEnum('verdict').notNull(),
  categoryScores: jsonb('category_scores').notNull(),
  publicSummary: text('public_summary'),
  analyzerVersion: text('analyzer_version').notNull().default('deterministic-v2'),
  scoringVersion: text('scoring_version').notNull().default('scoring-v2'),
  reportGeneratorVersion: text('report_generator_version'),
  rubricVersion: integer('rubric_version'),
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
  isPublic: boolean('is_public').notNull().default(false),
  publicToken: text('public_token').unique(),
  viewCount: integer('view_count').notNull().default(0),
})

export const reportFeedback = pgTable('report_feedback', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  reportId: text('report_id').notNull().references(() => projectVerificationReports.id),
  userId: text('user_id').notNull().references(() => users.id),
  accuracyRating: integer('accuracy_rating').notNull(),
  missedEvidence: text('missed_evidence'),
  notes: text('notes'),
  wouldShare: boolean('would_share'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('report_feedback_report_user_idx').on(t.reportId, t.userId),
])

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id'),
  eventType: text('event_type').notNull(),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
