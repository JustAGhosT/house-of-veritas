import { eventStore, RealTimeEvent } from '@/lib/realtime/event-store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || 'hans'

  // Create a unique listener ID for this connection
  const listenerId = `sse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({
        type: 'connected',
        message: 'Real-time connection established',
        listenerId,
        timestamp: new Date().toISOString(),
      })}\n\n`
      controller.enqueue(encoder.encode(connectMessage))

      // Send recent events for this user
      const recentEvents = eventStore.getEventsForUser(userId, 10)
      if (recentEvents.length > 0) {
        const historyMessage = `data: ${JSON.stringify({
          type: 'history',
          events: recentEvents,
        })}\n\n`
        controller.enqueue(encoder.encode(historyMessage))
      }

      // Subscribe to new events
      const unsubscribe = eventStore.subscribe(listenerId, (event: RealTimeEvent) => {
        // Only send events meant for this user or all users
        if (!event.userId || event.userId === userId || userId === 'hans') {
          try {
            const message = `data: ${JSON.stringify(event)}\n\n`
            controller.enqueue(encoder.encode(message))
          } catch (error) {
            console.error('Error sending SSE event:', error)
          }
        }
      })

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
          })}\n\n`
          controller.enqueue(encoder.encode(heartbeat))
        } catch (error) {
          // Connection closed, cleanup
          clearInterval(heartbeatInterval)
          unsubscribe()
        }
      }, 30000)

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval)
        unsubscribe()
        eventStore.unsubscribe(listenerId)
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
