"use client"

export function GridRoomBackground() {
  return (
    <div className="grid-room-bg" aria-hidden="true">
      <div className="grid-room-walls" />
      <div className="grid-room-floor" />
      <div className="grid-room-glow" />
    </div>
  )
}

export function SimpleGridBackground() {
  return <div className="simple-grid-bg" aria-hidden="true" />
}
