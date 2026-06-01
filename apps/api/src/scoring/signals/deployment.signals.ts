export interface DeploymentSignals {
  hasDockerfile: boolean
  hasDockerCompose: boolean
  hasCiWorkflow: boolean
  hasDeploymentWorkflow: boolean
  hasInfrastructureConfig: boolean
  detectedDeploymentFiles: string[]
}
