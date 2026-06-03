export interface DocumentationSignals {
  hasReadme: boolean
  readmeWordCount: number
  hasSetupInstructions: boolean
  hasApiDocs: boolean
  hasArchitectureDocs: boolean
  hasContributionDocs: boolean
  detectedDocFiles: string[]
}
