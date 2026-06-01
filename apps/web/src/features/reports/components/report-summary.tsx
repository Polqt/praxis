'use client'

type Props = {
  summary: string
}

export function ReportSummary({ summary }: Props) {
  return (
    <p className="text-base text-muted-foreground leading-relaxed">{summary}</p>
  )
}
