import type { CategoryScore, CategoryScorer } from '../engine/category-scorer.interface'
import type { StylingSignals } from '../signals/styling.signals'

export class StylingScorer implements CategoryScorer<StylingSignals> {
  score(signals: StylingSignals): CategoryScore {
    if (!signals.hasStylingApproach) {
      return {
        score: 2,
        narrative: 'No styling library or CSS files detected.',
        citations: [],
        status: 'fail',
        signals: {},
      }
    }

    let s = 5
    if (signals.detectedStylingLibrary) s += 2
    if (signals.hasGlobalStyles) s += 1
    if (signals.hasResponsivePatterns) s += 2
    const score = Math.min(10, s)

    const parts: string[] = []
    if (signals.detectedStylingLibrary) parts.push(`Styling library: ${signals.detectedStylingLibrary}.`)
    else parts.push('CSS/styling files detected without a recognized library.')
    if (signals.hasGlobalStyles) parts.push('Global stylesheet present.')
    if (signals.hasResponsivePatterns) parts.push('Responsive design patterns detected.')

    return {
      score,
      narrative: parts.join(' '),
      citations: signals.stylingFilePaths,
      status: score >= 5 ? 'pass' : 'fail',
      signals: { detectedStylingLibrary: signals.detectedStylingLibrary, hasResponsivePatterns: signals.hasResponsivePatterns },
    }
  }
}
