export function GridPattern() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-20"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    />
  )
}
