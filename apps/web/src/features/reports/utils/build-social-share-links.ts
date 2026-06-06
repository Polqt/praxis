import type { ReportShareSummary } from '@/features/reports/types'

export function buildSocialShareLinks(summary: ReportShareSummary) {
  const proofUrl = summary.publicToken
    ? `https://praxis.dev/proof/${summary.publicToken}`
    : null
  const intro =
    summary.verdict === 'verified'
      ? `I just got my ${summary.challengeTitle} verified on Praxis.`
      : `I just submitted my ${summary.challengeTitle} for verification on Praxis.`
  const bestCategoryLine =
    summary.bestCategory && summary.bestCategory.score >= 8
      ? `Top category: ${summary.bestCategory.name} ${summary.bestCategory.score}/10.`
      : null
  const shareText = [
    intro,
    `Score: ${summary.compositeScore}/100. Verdict: ${summary.verdict}.`,
    bestCategoryLine,
    proofUrl ?? '',
    '#ProofOfWork #Praxis',
  ]
    .filter(Boolean)
    .join(' ')

  return {
    xUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    redditUrl: `https://www.reddit.com/submit?title=${encodeURIComponent(shareText)}${proofUrl ? `&url=${encodeURIComponent(proofUrl)}` : ''}`,
  }
}
