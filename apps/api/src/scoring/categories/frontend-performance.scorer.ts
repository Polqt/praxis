import type { CategoryScore, CategoryScorer } from '../engine/category-scorer.interface'
import type { FrontendPerformanceSignals } from '../signals/frontend-performance.signals'

export class FrontendPerformanceScorer implements CategoryScorer<FrontendPerformanceSignals> {
  score(signals: FrontendPerformanceSignals): CategoryScore {
    let s = 3
    if (signals.hasNextConfig || signals.hasBundleConfig) s += 2
    if (signals.hasImageOptimization) s += 2
    if (signals.hasLazyLoading) s += 2
    if (signals.hasCodeSplitting) s += 1
    const score = Math.min(10, s)

    const found: string[] = []
    if (signals.hasNextConfig) found.push('Next.js config')
    if (signals.hasImageOptimization) found.push('image optimization')
    if (signals.hasLazyLoading) found.push('lazy loading / Suspense')
    if (signals.hasCodeSplitting) found.push('code splitting')

    const narrative = found.length > 0
      ? `Performance signals detected: ${found.join(', ')}.`
      : 'No performance optimization patterns detected (image optimization, lazy loading, or code splitting).'

    return {
      score,
      narrative,
      citations: [],
      status: score >= 5 ? 'pass' : 'fail',
      signals: { hasImageOptimization: signals.hasImageOptimization, hasLazyLoading: signals.hasLazyLoading },
    }
  }
}
