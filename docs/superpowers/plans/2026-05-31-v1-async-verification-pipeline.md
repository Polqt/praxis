# Praxis v1 Async Verification Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the BullMQ/Redis-backed async repository verification pipeline for Praxis v1.

**Architecture:** The API creates submissions and enqueues small `{ submissionId }` jobs. A separate NestJS worker process performs ingestion, deterministic analysis, report generation, skill awarding, and expiry handling. Repository ingestion and analysis are cached independently by repo ID and commit SHA.

**Tech Stack:** NestJS, Drizzle ORM, Postgres, BullMQ, Redis, GitHub REST API, TypeScript

---

## File Map

**Create:**
- `apps/api/src/queue/queue.constants.ts` - queue and job names.
- `apps/api/src/queue/queue.module.ts` - BullMQ queue provider.
- `apps/api/src/queue/queue.service.ts` - enqueue helpers.
- `apps/api/src/worker.ts` - standalone worker bootstrap.
- `apps/api/src/worker/worker.module.ts` - worker-only Nest module.
- `apps/api/src/worker/verification.worker.ts` - BullMQ worker registration and job dispatch.
- `apps/api/src/worker/worker-health.service.ts` - Redis heartbeat.
- `apps/api/src/submissions/submission-status.service.ts` - idempotent status transitions.
- `apps/api/src/ingestion/repository-ingestion.service.ts` - GitHub repository ingestion and cache writes.
- `apps/api/src/ingestion/repository-ingestion.types.ts` - normalized ingestion data types.
- `apps/api/src/analysis/repository-analysis.service.ts` - deterministic hard-signal analyzer.
- `apps/api/src/analysis/repository-analysis.types.ts` - analysis output types.
- `apps/api/src/reports/reports.service.ts` - report generation and visibility.
- `apps/api/src/reports/reports.controller.ts` - private report endpoints.
- `apps/api/src/reports/proof.controller.ts` - public proof endpoint.
- `apps/api/src/reports/reports.module.ts` - report module.
- `apps/api/src/health/health.controller.ts` - API/DB/Redis/worker health.
- `apps/api/src/health/health.module.ts` - health module.
- `apps/api/drizzle/0005_repository_ingestions_and_analyses.sql` - cache tables and indexes.

**Modify:**
- `apps/api/package.json` - add BullMQ/ioredis dependencies and worker scripts.
- `apps/api/src/config/configuration.ts` - add `REDIS_URL` and pipeline limits.
- `apps/api/src/database/schema.ts` - add `repositoryIngestions` and `repositoryAnalyses`.
- `apps/api/src/github/github-api.service.ts` - add tree/content helpers.
- `apps/api/src/submissions/submissions.service.ts` - enqueue `ingest-repo` after submission creation.
- `apps/api/src/app.module.ts` - import queue, reports, health modules.

---

## Task 1: Schema And Config Foundation

- [ ] Add `repository_ingestions` table with unique `(github_repo_id, commit_sha)`.
- [ ] Add `repository_analyses` table with unique `(repository_ingestion_id, analyzer_version)`.
- [ ] Add Drizzle schema exports.
- [ ] Add migration metadata.
- [ ] Add `REDIS_URL` config.
- [ ] Verify API build.

## Task 2: Queue Foundation

- [ ] Install `bullmq` and `ioredis`.
- [ ] Add queue constants and queue service.
- [ ] Add job defaults: 3 attempts, exponential backoff, retained failures.
- [ ] Add queue module.
- [ ] Write failing queue payload-shape test first.
- [ ] Verify test and API build.

## Task 3: Worker Bootstrap

- [ ] Add `worker.ts` entrypoint.
- [ ] Add worker module.
- [ ] Add BullMQ worker dispatcher.
- [ ] Add worker heartbeat service.
- [ ] Add worker scripts.
- [ ] Verify worker starts far enough to validate config.

## Task 4: Status Transition Service

- [ ] Write failing tests for allowed transitions, terminal-state idempotency, and event writes.
- [ ] Implement `SubmissionStatusService`.
- [ ] Update timestamps and failure reasons consistently.
- [ ] Verify focused tests and API build.

## Task 5: Repository Ingestion

- [ ] Extend GitHub API service for trees and file contents.
- [ ] Write failing tests for file selection, byte limits, binary skipping, and cache reuse.
- [ ] Implement normalized ingestion service.
- [ ] Store canonical data in `repository_ingestions`.
- [ ] Copy/cache reference into `project_submissions.ingested_data` for compatibility.
- [ ] Verify focused tests and API build.

## Task 6: Deterministic Analysis

- [ ] Write failing tests for hard signals: tests, CI, env usage, migrations, auth, dependency risk, deployment.
- [ ] Implement deterministic analyzer.
- [ ] Store reusable output in `repository_analyses`.
- [ ] Verify focused tests and API build.

## Task 7: Report Generation And Proof Endpoints

- [ ] Write failing tests for rubric floors, verdict mapping, public sanitization, and token generation.
- [ ] Implement report generation with `deterministic-v1`.
- [ ] Add private report endpoints.
- [ ] Add public proof endpoint.
- [ ] Ensure public responses exclude tokens, ingested data, raw source, and hidden analysis.
- [ ] Verify focused tests and API build.

## Task 8: Worker Job Flow

- [ ] Wire `ingest-repo -> analyze-project -> generate-report -> award-skills`.
- [ ] Add final-failure handling to set failed statuses.
- [ ] Add repeatable/stale expiry handler.
- [ ] Ensure every job only accepts `{ submissionId }`.
- [ ] Verify worker build/start and API build.

## Task 9: Health Checks

- [ ] Add `/api/health`.
- [ ] Check API, DB, Redis, and worker heartbeat.
- [ ] Verify health output with Redis configured.

## Task 10: Final Verification

- [ ] Run focused tests.
- [ ] Run `pnpm build` in `apps/api`.
- [ ] Run shared/web type checks if shared types changed.
- [ ] Run live DB audit.
- [ ] Run seed if schema changes require it.
- [ ] Commit in small logical commits.

