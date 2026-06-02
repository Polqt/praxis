import type { CategoryScore, CategoryScorer } from '../engine/category-scorer.interface'
import type { StateManagementSignals } from '../signals/state-management.signals'

export class StateManagementScorer implements CategoryScorer<StateManagementSignals> {
  score(signals: StateManagementSignals): CategoryScore {
    const hasAny = signals.hasStateLibrary || signals.hasContextApi || signals.hasCustomHooks
    if (!hasAny) {
      return {
        score: 2,
        narrative: 'No state management library, Context API usage, or custom hooks detected.',
        citations: [],
        status: 'fail',
        signals: {},
      }
    }

    let s = 4
    if (signals.hasStateLibrary) s += 3
    if (signals.hasContextApi) s += 2
    if (signals.hasCustomHooks) s += 2
    const score = Math.min(10, s)

    const parts: string[] = []
    if (signals.detectedStateLibrary) parts.push(`State library detected: ${signals.detectedStateLibrary}.`)
    if (signals.hasContextApi) parts.push('React Context API usage detected.')
    if (signals.hasCustomHooks) parts.push(`${signals.customHookPaths.length} custom hook(s) detected.`)

    return {
      score,
      narrative: parts.join(' '),
      citations: signals.customHookPaths,
      status: score >= 5 ? 'pass' : 'fail',
      signals: { hasStateLibrary: signals.hasStateLibrary, detectedStateLibrary: signals.detectedStateLibrary },
    }
  }
}
