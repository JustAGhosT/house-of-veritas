"use client"

import React, { Component, type ReactNode } from "react"
import { ErrorDisplay, flattenErrors } from "@/components/error-display"
import { logger } from "@/lib/logger"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  errors: Error[]
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errors: [] }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState((prev) => ({
      errors: [...prev.errors, error],
    }))
    logger.error("ErrorBoundary caught", {
      error: error.message,
      componentStack: info.componentStack,
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, errors: [] })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      const errors = this.state.errors.length > 0
        ? this.state.errors.flatMap(flattenErrors)
        : flattenErrors(new Error("An unexpected error occurred"))

      return (
        <ErrorDisplay
          errors={errors}
          onRetry={this.handleRetry}
          variant="inline"
        />
      )
    }

    return this.props.children
  }
}
