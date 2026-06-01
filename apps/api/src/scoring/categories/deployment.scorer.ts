import type { CategoryScore, CategoryScorer } from '../engine/category-scorer.interface'
import type { DeploymentSignals } from '../signals/deployment.signals'
import { buildDeploymentNarrative } from '../narratives/narrative-builder'

const FLOOR_CONDITION = (s: DeploymentSignals) => !s.hasCiWorkflow && !s.hasDockerfile

const DOCKERFILE_POINTS = 2
const DOCKER_COMPOSE_POINTS = 1
const CI_WORKFLOW_POINTS = 3
const DEPLOYMENT_WORKFLOW_POINTS = 2
const INFRASTRUCTURE_POINTS = 2

export class DeploymentScorer implements CategoryScorer<DeploymentSignals> {
  score(signals: DeploymentSignals): CategoryScore {
    const isFloor = FLOOR_CONDITION(signals)

    const dockerfilePoints = signals.hasDockerfile ? DOCKERFILE_POINTS : 0
    const composePoints = signals.hasDockerCompose ? DOCKER_COMPOSE_POINTS : 0
    const ciPoints = signals.hasCiWorkflow ? CI_WORKFLOW_POINTS : 0
    const deployPoints = signals.hasDeploymentWorkflow ? DEPLOYMENT_WORKFLOW_POINTS : 0
    const infraPoints = signals.hasInfrastructureConfig ? INFRASTRUCTURE_POINTS : 0

    const rawScore = dockerfilePoints + composePoints + ciPoints + deployPoints + infraPoints
    const finalScore = Math.min(10, rawScore)

    const status = isFloor ? 'floor' : finalScore >= 5 ? 'pass' : 'fail'

    return {
      score: finalScore,
      narrative: buildDeploymentNarrative(signals),
      citations: signals.detectedDeploymentFiles,
      status,
      signals: {
        hasDockerfile: signals.hasDockerfile,
        hasDockerCompose: signals.hasDockerCompose,
        hasCiWorkflow: signals.hasCiWorkflow,
        hasDeploymentWorkflow: signals.hasDeploymentWorkflow,
        hasInfrastructureConfig: signals.hasInfrastructureConfig,
      },
    }
  }
}
