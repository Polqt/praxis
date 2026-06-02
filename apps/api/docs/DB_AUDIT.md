# DB Audit Report

**Date:** 2026-06-02T04:41:17.549Z
**Database:** Supabase direct (port 5432)

## Results

| Check | Status | Detail |
|-------|--------|--------|
| table:users | ✅ PASS | exists |
| table:tracks | ✅ PASS | exists |
| table:skills | ✅ PASS | exists |
| table:user_skills | ✅ PASS | exists |
| table:project_challenges | ✅ PASS | exists |
| table:github_accounts | ✅ PASS | exists |
| table:project_submissions | ✅ PASS | exists |
| table:project_submission_events | ✅ PASS | exists |
| table:project_verification_reports | ✅ PASS | exists |
| table:repository_ingestions | ✅ PASS | exists |
| table:repository_analyses | ✅ PASS | exists |
| table:audit_logs | ✅ PASS | exists |
| rls:audit_logs | ✅ PASS | enabled |
| rls:github_accounts | ✅ PASS | enabled |
| rls:project_challenges | ✅ PASS | enabled |
| rls:project_submission_events | ✅ PASS | enabled |
| rls:project_submissions | ✅ PASS | enabled |
| rls:project_verification_reports | ✅ PASS | enabled |
| rls:repository_analyses | ✅ PASS | enabled |
| rls:repository_ingestions | ✅ PASS | enabled |
| rls:skills | ✅ PASS | enabled |
| rls:tracks | ✅ PASS | enabled |
| rls:user_skills | ✅ PASS | enabled |
| rls:users | ✅ PASS | enabled |
| schema:ingested_data_dropped | ✅ PASS | ingested_data column dropped from project_submissions |
| schema:ai_model_version_dropped | ✅ PASS | ai_model_version column dropped from project_verification_reports |
| schema:report_generator_version_exists | ✅ PASS | report_generator_version column present in project_verification_reports |
| schema:analyzer_version_exists | ✅ PASS | analyzer_version column present in project_verification_reports |
| schema:audit_logs_exists | ✅ PASS | audit_logs table exists |
| enum:submission_status_no_awaiting_human_review | ✅ PASS | Values: created, queued, ingesting, ingestion_failed, analyzing, analysis_failed, generating_report, report_generation_failed, verified, insufficient, failed, expired |
| enum:verdict_no_conditional | ✅ PASS | Values: verified, insufficient, failed |
| index:users_username_unique | ✅ PASS | exists |
| access:service_role_audit_insert | ✅ PASS | INSERT + DELETE on audit_logs succeeded |
| info:drizzle_migration_hashes | ✅ PASS | 3 hash(es) tracked in drizzle.__drizzle_migrations (migrations 0009-0011 were applied directly, not via drizzle-kit) |

## Summary

- Passed: 34
- Failed: 0
