export interface DatabaseSignals {
  hasMigrationFiles: boolean
  migrationFileCount: number
  hasOrmLibrary: boolean
  hasSchemaDefinitions: boolean
  hasRelationPatterns: boolean
  hasTransactionPatterns: boolean
  hasSeedData: boolean
  detectedOrmLibrary: string | null
  detectedMigrationPaths: string[]
}
