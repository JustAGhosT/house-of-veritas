// Real-time event types
export type EventType = 
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'expense_created'
  | 'expense_approved'
  | 'expense_rejected'
  | 'clock_in'
  | 'clock_out'
  | 'notification'
  | 'document_signed'
  | 'approval_required'
  | 'system_alert'

export interface RealTimeEvent {
  id: string
  type: EventType
  data: any
  userId?: string // Target user (if specific)
  timestamp: Date
}

// Event store for SSE broadcasting
class EventStore {
  private events: RealTimeEvent[] = []
  private listeners: Map<string, (event: RealTimeEvent) => void> = new Map()
  private maxEvents = 100

  addEvent(event: Omit<RealTimeEvent, 'id' | 'timestamp'>) {
    const fullEvent: RealTimeEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    this.events.unshift(fullEvent)
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents)
    }

    // Notify all listeners
    this.listeners.forEach((callback, listenerId) => {
      try {
        callback(fullEvent)
      } catch (error) {
        console.error(`Error notifying listener ${listenerId}:`, error)
      }
    })

    return fullEvent
  }

  subscribe(listenerId: string, callback: (event: RealTimeEvent) => void) {
    this.listeners.set(listenerId, callback)
    return () => this.listeners.delete(listenerId)
  }

  unsubscribe(listenerId: string) {
    this.listeners.delete(listenerId)
  }

  getRecentEvents(count: number = 20): RealTimeEvent[] {
    return this.events.slice(0, count)
  }

  getEventsForUser(userId: string, count: number = 20): RealTimeEvent[] {
    return this.events
      .filter(e => !e.userId || e.userId === userId || userId === 'hans')
      .slice(0, count)
  }
}

// Singleton instance
export const eventStore = new EventStore()

// Helper functions to emit events
export function emitTaskEvent(
  type: 'task_created' | 'task_updated' | 'task_completed',
  task: any,
  userId?: string
) {
  return eventStore.addEvent({
    type,
    data: task,
    userId,
  })
}

export function emitExpenseEvent(
  type: 'expense_created' | 'expense_approved' | 'expense_rejected',
  expense: any,
  userId?: string
) {
  return eventStore.addEvent({
    type,
    data: expense,
    userId,
  })
}

export function emitClockEvent(
  type: 'clock_in' | 'clock_out',
  entry: any,
  userId?: string
) {
  return eventStore.addEvent({
    type,
    data: entry,
    userId,
  })
}

export function emitNotification(
  notification: any,
  userId?: string
) {
  return eventStore.addEvent({
    type: 'notification',
    data: notification,
    userId,
  })
}

export function emitApprovalRequired(
  item: any,
  userId: string = 'hans' // Approvals go to admin
) {
  return eventStore.addEvent({
    type: 'approval_required',
    data: item,
    userId,
  })
}

export function emitSystemAlert(
  alert: { title: string; message: string; severity: 'info' | 'warning' | 'error' }
) {
  return eventStore.addEvent({
    type: 'system_alert',
    data: alert,
  })
}
