"use client"

import { useState, useEffect } from 'react'
import { logger } from "@/lib/logger"
import { apiFetch } from "@/lib/api-client"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  status: string
  colorId?: string
}

const COLOR_MAP: Record<string, string> = {
  '1': 'bg-blue-500',
  '2': 'bg-green-500',
  '3': 'bg-purple-500',
  '4': 'bg-red-500',
  '5': 'bg-amber-500',
  '6': 'bg-orange-500',
  '7': 'bg-teal-500',
  '8': 'bg-gray-500',
  '9': 'bg-pink-500',
}

export function CalendarPanel() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'mock' | 'live'>('mock')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const data = await apiFetch<{ items?: CalendarEvent[]; mode?: 'mock' | 'live' }>('/api/calendar', { label: 'Calendar' })
      setEvents(data?.items || [])
      setMode(data?.mode || 'mock')
    } catch (error) {
      logger.error('Failed to fetch calendar events', { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    return { daysInMonth, startingDay }
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate)

  const getEventsForDate = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const targetDateStr = targetDate.toISOString().split('T')[0]
    
    return events.filter(event => {
      const eventDate = event.start.dateTime || event.start.date
      if (!eventDate) return false
      return eventDate.startsWith(targetDateStr)
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Calendar</h2>
            <p className="text-white/50 text-sm">
              {mode === 'mock' ? 'Demo Mode' : 'Connected to Google Calendar'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Mode Alert */}
      {mode === 'mock' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Using demo data. Configure Google Calendar API for live sync.</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white/5 rounded-2xl border border-white/10 p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-white font-semibold text-lg">{monthName}</h3>
              <button
                type="button"
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-white/40 text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayEvents = getEventsForDate(day)
                const isToday = 
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear()
                
                return (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
                      setShowCreateModal(true)
                    }}
                    className={`aspect-square p-1 rounded-lg transition-colors relative ${
                      isToday 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <span className="text-sm">{day}</span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((evt, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${COLOR_MAP[evt.colorId || '1']}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
            <h3 className="text-white font-semibold mb-4">Upcoming Events</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-white/50 text-sm text-center py-8">No upcoming events</p>
              ) : (
                events.slice(0, 10).map(event => {
                  const eventDate = event.start.dateTime || event.start.date
                  const displayDate = eventDate 
                    ? new Date(eventDate).toLocaleDateString('en-ZA', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    : ''
                  const displayTime = event.start.dateTime
                    ? new Date(event.start.dateTime).toLocaleTimeString('en-ZA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'All day'

                  return (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-1 h-12 rounded-full ${COLOR_MAP[event.colorId || '1']}`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm truncate">
                            {event.summary}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-white/50 text-xs">
                            <CalendarIcon className="w-3 h-3" />
                            {displayDate}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-white/50 text-xs">
                            <Clock className="w-3 h-3" />
                            {displayTime}
                          </div>
                          {event.description && (
                            <p className="text-white/40 text-xs mt-2 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => {
            setShowCreateModal(false)
            setSelectedDate(null)
          }}
          onCreated={() => {
            setShowCreateModal(false)
            setSelectedDate(null)
            fetchEvents()
          }}
          initialDate={selectedDate}
        />
      )}
    </div>
  )
}

function CreateEventModal({ 
  onClose, 
  onCreated,
  initialDate 
}: { 
  onClose: () => void
  onCreated: () => void
  initialDate: Date | null
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    summary: '',
    description: '',
    date: initialDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    allDay: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const start = form.allDay 
        ? form.date 
        : `${form.date}T${form.startTime}:00`
      const end = form.allDay 
        ? form.date 
        : `${form.date}T${form.endTime}:00`

      await apiFetch('/api/calendar', {
        method: 'POST',
        body: { summary: form.summary, description: form.description, start, end, allDay: form.allDay },
        label: 'Calendar',
      })

      onCreated()
    } catch (error) {
      logger.error('Failed to create event', { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-[#0d0d12] rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Create Event</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            aria-label="Close event form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="calendar-event-title" className="block text-white/60 text-sm mb-2">Event Title</label>
            <input
              id="calendar-event-title"
              type="text"
              value={form.summary}
              onChange={(e) => setForm(prev => ({ ...prev, summary: e.target.value }))}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <label htmlFor="calendar-event-description" className="block text-white/60 text-sm mb-2">Description</label>
            <textarea
              id="calendar-event-description"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 resize-none"
              placeholder="Event description (optional)"
            />
          </div>

          <div>
            <label htmlFor="calendar-event-date" className="block text-white/60 text-sm mb-2">Date</label>
            <input
              id="calendar-event-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allDay"
              checked={form.allDay}
              onChange={(e) => setForm(prev => ({ ...prev, allDay: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="allDay" className="text-white/60 text-sm">All day event</label>
          </div>

          {!form.allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="calendar-event-start" className="block text-white/60 text-sm mb-2">Start Time</label>
                <input
                  id="calendar-event-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                />
              </div>
              <div>
                <label htmlFor="calendar-event-end" className="block text-white/60 text-sm mb-2">End Time</label>
                <input
                  id="calendar-event-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CalendarPanel
