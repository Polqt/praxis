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
  'awaiting_human_review',
  'verified',
  'insufficient',
  'failed',
  'expired',
])

export const projectTypeEnum = pgEnum('project_type', [
  'frontend',
  'backend',
  'fullstack',
])

export const verdictEnum = pgEnum('verdict', [
  'verified',
  'conditional',
  'insufficient',
  'failed',
])

export const sourceTypeEnum = pgEnum('source_type', [
  'project',
  'task',
])

// =====================
// TABLES
// =====================

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  supabaseUid: text('supabase_uid').unique().notNull(),
  email: text('email').notNull(),
  username: text('username'),
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
  ingestedData: jsonb('ingested_data'),
  rubricVersion: integer('rubric_version').notNull(),
}, (t) => [
  uniqueIndex('project_submissions_user_challenge_commit_idx').on(
    t.userId, t.challengeId, t.commitSha,
  ),
])

export const projectVerificationReports = pgTable('project_verification_reports', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  submissionId: text('submission_id').unique().notNull().references(() => projectSubmissions.id),
  compositeScore: integer('composite_score').notNull(),
  verdict: verdictEnum('verdict').notNull(),
  categoryScores: jsonb('category_scores').notNull(),
  publicSummary: text('public_summary'),
  aiModelVersion: text('ai_model_version').notNull(),
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
  isPublic: boolean('is_public').notNull().default(false),
  publicToken: text('public_token').unique(),
})
