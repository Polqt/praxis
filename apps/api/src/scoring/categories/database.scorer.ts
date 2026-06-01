import type { CategoryScore, CategoryScorer } from '../engine/category-scorer.interface'
import type { DatabaseSignals } from '../signals/database.signals'
import { buildDatabaseNarrative } from '../narratives/narrative-builder'

const FLOOR_CONDITION = (s: DatabaseSignals) => !s.hasOrmLibrary && !s.hasMigrationFiles && !s.hasSchemaDefinitions

const ORM_LIBRARY_POINTS = 2
const MIGRATION_POINTS = 3
const SCHEMA_POINTS = 2
const RELATION_POINTS = 1
const TRANSACTION_POINTS = 1
const SEED_DATA_POINTS = 1

export class DatabaseScorer implements CategoryScorer<DatabaseSignals> {
  score(signals: DatabaseSignals): CategoryScore {
    const isFloor = FLOOR_CONDITION(signals)

    const ormPoints = signals.hasOrmLibrary ? ORM_LIBRARY_POINTS : 0
    const migrationPoints = signals.hasMigrationFiles ? MIGRATION_POINTS : 0
    const schemaPoints = signals.hasSchemaDefinitions ? SCHEMA_POINTS : 0
    const relationPoints = signals.hasRelationPatterns ? RELATION_POINTS : 0
    const transactionPoints = signals.hasTransactionPatterns ? TRANSACTION_POINTS : 0
    const seedPoints = signals.hasSeedData ? SEED_DATA_POINTS : 0

    const rawScore = ormPoints + migrationPoints + schemaPoints + relationPoints + transactionPoints + seedPoints
    const finalScore = Math.min(10, rawScore)

    const status = isFloor ? 'floor' : finalScore >= 5 ? 'pass' : 'fail'

    return {
      score: finalScore,
      narrative: buildDatabaseNarrative(signals),
      citations: signals.detectedMigrationPaths,
      status,
      signals: {
        hasOrmLibrary: signals.hasOrmLibrary,
        hasMigrationFiles: signals.hasMigrationFiles,
        migrationFileCount: signals.migrationFileCount,
        hasSchemaDefinitions: signals.hasSchemaDefinitions,
        hasRelationPatterns: signals.hasRelationPatterns,
        hasTransactionPatterns: signals.hasTransactionPatterns,
        hasSeedData: signals.hasSeedData,
        detectedOrmLibrary: signals.detectedOrmLibrary,
      },
    }
  }
}
