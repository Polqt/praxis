export const ANALYZER_VERSION = 'deterministic-v1'

export interface HardSignal {
  present: boolean
  confidence: number
  citations: string[]
}

export interface RepositoryAnalysisData {
  analyzerVersion: string
  hardSignals: {
    tests: HardSignal
    ci: HardSignal
    envUsage: HardSignal
    migrations: HardSignal
    auth: HardSignal
    documentation: HardSignal
    dependencyRisk: { level: 'low' | 'medium' | 'high'; citations: string[] }
    deployment: HardSignal
  }
}
