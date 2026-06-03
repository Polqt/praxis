'use client'

import { Component, type ReactNode } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class ScoreErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 flex items-start gap-3">
          <IconAlertTriangle size={15} className="text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Score data could not be displayed</p>
            <p className="text-xs text-muted-foreground mt-1">
              There was a problem rendering the rubric scores. The underlying report data may be malformed.
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
