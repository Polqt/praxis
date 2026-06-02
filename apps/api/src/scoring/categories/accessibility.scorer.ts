import type { CategoryScore, CategoryScorer } from '../engine/category-scorer.interface'
import type { AccessibilitySignals } from '../signals/accessibility.signals'

export class AccessibilityScorer implements CategoryScorer<AccessibilitySignals> {
  score(signals: AccessibilitySignals): CategoryScore {
    let s = 2
    if (signals.hasAriaAttributes) s += 3
    if (signals.hasSemanticHtml) s += 2
    if (signals.hasAltAttributes) s += 2
    if (signals.hasA11yLintConfig) s += 2
    const score = Math.min(10, s)

    const found: string[] = []
    const missing: string[] = []
    signals.hasAriaAttributes ? found.push('ARIA attributes') : missing.push('ARIA attributes')
    signals.hasSemanticHtml ? found.push('semantic HTML elements') : missing.push('semantic HTML')
    signals.hasAltAttributes ? found.push('alt text on images') : missing.push('alt attributes')
    signals.hasA11yLintConfig ? found.push('a11y lint config') : missing.push('a11y lint config')

    const narrative = [
      found.length > 0 ? `Detected: ${found.join(', ')}.` : 'No accessibility signals detected.',
      missing.length > 0 ? `Not found: ${missing.join(', ')}.` : '',
    ].filter(Boolean).join(' ')

    return {
      score,
      narrative,
      citations: signals.detectedA11yFiles,
      status: score >= 5 ? 'pass' : 'fail',
      signals: { hasAriaAttributes: signals.hasAriaAttributes, hasSemanticHtml: signals.hasSemanticHtml },
    }
  }
}
