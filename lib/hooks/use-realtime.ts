"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { RealTimeEvent, EventType } from '@/lib/realtime/event-store'
import { logger } from '@/lib/logger'

interface UseRealTimeOptions {
  userId: string
  onEvent?: (event: RealTimeEvent) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  autoReconnect?: boolean
  reconnectDelay?: number
}

interface UseRealTimeReturn {
  isConnected: boolean
  events: RealTimeEvent[]
  lastEvent: RealTimeEvent | null
  error: Error | null
  reconnect: () => void
  disconnect: () => void
  clearEvents: () => void
}

export function useRealTime(options: UseRealTimeOptions): UseRealTimeReturn {
  const {
    userId,
    onEvent,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    reconnectDelay = 3000,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<RealTimeEvent[]>([])
  const [lastEvent, setLastEvent] = useState<RealTimeEvent | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const connectRef = useRef<() => void>(() => {})

  const connect = useCallback(() => {
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const eventSource = new EventSource(`/api/realtime/events?userId=${userId}`)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnected(true)
        setError(null)
        onConnect?.()
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Handle different message types
          if (data.type === 'connected') {
            logger.info('Real-time connected', { listenerId: data.listenerId })
            return
          }

          if (data.type === 'heartbeat') {
            // Heartbeat received, connection is alive
            return
          }

          if (data.type === 'history') {
            // Received historical events
            setEvents((prev) => [...data.events, ...prev].slice(0, 50))
            return
          }

          // Regular event
          const realTimeEvent: RealTimeEvent = {
            ...data,
            timestamp: new Date(data.timestamp),
          }

          setLastEvent(realTimeEvent)
          setEvents((prev) => [realTimeEvent, ...prev].slice(0, 50))
          onEvent?.(realTimeEvent)
        } catch (err) {
          logger.error('Error parsing SSE message', { error: err instanceof Error ? err.message : String(err) })
        }
      }

      eventSource.onerror = (err) => {
        logger.error('SSE error', { error: err })
        setIsConnected(false)
        setError(new Error('Connection lost'))
        onError?.(new Error('Connection lost'))
        onDisconnect?.()

        // Auto reconnect
        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            logger.info('Attempting to reconnect')
            connectRef.current()
          }, reconnectDelay)
        }
      }
    } catch (err) {
      setError(err as Error)
      onError?.(err as Error)
    }
  }, [userId, onEvent, onConnect, onDisconnect, onError, autoReconnect, reconnectDelay])

  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
    onDisconnect?.()
  }, [onDisconnect])

  const reconnect = useCallback(() => {
    disconnect()
    connect()
  }, [connect, disconnect])

  const clearEvents = useCallback(() => {
    setEvents([])
    setLastEvent(null)
  }, [])

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connectRef.current()
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, []) // Only run on mount/unmount

  // Reconnect if userId changes
  useEffect(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      connectRef.current()
    }
  }, [userId])

  return {
    isConnected,
    events,
    lastEvent,
    error,
    reconnect,
    disconnect,
    clearEvents,
  }
}

// Hook for filtering events by type
export function useFilteredEvents(
  events: RealTimeEvent[],
  types: EventType[]
): RealTimeEvent[] {
  return events.filter((e) => types.includes(e.type as EventType))
}

// Hook for emitting events
export function useEmitEvent() {
  const emit = useCallback(async (
    type: string,
    data: any,
    userId?: string
  ) => {
    try {
      const response = await fetch('/api/realtime/emit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to emit event')
      }

      return await response.json()
    } catch (error) {
      logger.error('Error emitting event', { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }, [])

  return { emit }
}
