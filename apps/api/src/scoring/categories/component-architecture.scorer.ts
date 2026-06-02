import type { CategoryScore, CategoryScorer } from '../engine/category-scorer.interface'
import type { ComponentArchitectureSignals } from '../signals/component-architecture.signals'

export class ComponentArchitectureScorer implements CategoryScorer<ComponentArchitectureSignals> {
  score(signals: ComponentArchitectureSignals): CategoryScore {
    if (signals.componentFileCount === 0) {
      return {
        score: 0,
        narrative: 'No component files (.tsx/.jsx) were detected.',
        citations: [],
        status: 'floor',
        signals: { componentFileCount: 0 },
      }
    }

    let s = signals.componentFileCount >= 5 ? 6 : 3
    if (signals.hasComponentDirectory) s += 1
    if (signals.hasIndexExports) s += 1
    if (signals.hasSharedComponents) s += 1
    if (signals.hasPropTypes) s += 1
    const score = Math.min(10, s)

    const parts: string[] = [`Detected ${signals.componentFileCount} component file(s).`]
    if (signals.hasComponentDirectory) parts.push('Component directory structure present.')
    if (signals.hasSharedComponents) parts.push('Shared/common component directory detected.')
    if (signals.hasIndexExports) parts.push('Index exports present for clean imports.')
    if (signals.hasPropTypes) parts.push('Typed props (TypeScript interfaces or PropTypes) detected.')

    return {
      score,
      narrative: parts.join(' '),
      citations: signals.componentFilePaths,
      status: score >= 5 ? 'pass' : 'fail',
      signals: { componentFileCount: signals.componentFileCount, hasComponentDirectory: signals.hasComponentDirectory },
    }
  }
}
