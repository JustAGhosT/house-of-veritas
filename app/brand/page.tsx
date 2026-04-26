import { IdentityBadgeCard } from "@/components/ui/identity-badge";
import { generateIdentityBadge } from "@/lib/design/badges";

function Color({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div 
        className="h-24 w-full rounded-lg border border-border shadow-sm" 
        style={{ backgroundColor: hex }}
      ></div>
      <div>
        <div className="font-semibold text-foreground font-sans">{name}</div>
        <div className="text-sm text-muted-foreground font-mono mt-1">{hex}</div>
      </div>
    </div>
  );
}

function SigilPreview() {
  const badge1 = generateIdentityBadge("Archivum");
  const badge2 = generateIdentityBadge("Vanguard");
  const badge3 = generateIdentityBadge("Oracle");
  
  badge1.accent = "gold";
  badge1.frame = "seal";
  badge1.rarity = "mythic";
  badge1.crest = "☾";

  badge2.accent = "crimson";
  badge2.frame = "shield";
  badge2.rarity = "rare";
  badge2.crest = "⚔";
  
  badge3.accent = "violet";
  badge3.frame = "compass";
  badge3.rarity = "rare";
  badge3.crest = "❂";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
      <IdentityBadgeCard badge={badge1} />
      <IdentityBadgeCard badge={badge2} />
      <IdentityBadgeCard badge={badge3} />
    </div>
  );
}

export default function BrandPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans pb-24 selection:bg-primary/30">
      <div className="noise-overlay" />
      <div className="vortex-glow opacity-50" />
      <div className="max-w-6xl mx-auto px-6 lg:px-12 pt-24 space-y-32">
        <section className="relative text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-serif text-primary tracking-wide">
            House of Veritas
          </h1>
          <p className="mt-8 text-xl md:text-2xl text-foreground/80 max-w-2xl leading-relaxed font-sans">
            A digital house of symbols, lineage, and crafted identity.
            <br/><br/>
            Where others choose usernames, members of the house carry sigils. Every name becomes a crest. Every mark carries meaning.
          </p>
        </section>

        <section>
          <div className="border-b border-border pb-4 mb-8">
            <h2 className="ornate-border inline-block rounded-xl px-4 py-2 text-3xl font-serif text-foreground">Brand Colors</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            <Color name="Obsidian" hex="#0F0F12" />
            <Color name="Old Ink" hex="#1B1B1F" />
            <Color name="Parchment" hex="#F5F1E6" />
            <Color name="Sigil Gold" hex="#D4AF37" />
            <Color name="Crimson" hex="#8B1E2D" />
            <Color name="Arcane Violet" hex="#4B2E83" />
          </div>
        </section>

        <section>
          <div className="border-b border-border pb-4 mb-8">
            <h2 className="ornate-border inline-block rounded-xl px-4 py-2 text-3xl font-serif text-foreground">Typography & Identity</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <h3 className="text-parchment/50 uppercase tracking-widest text-sm mb-2">Heading (Cinzel)</h3>
                <div className="text-4xl font-serif">HOUSE OF VERITAS</div>
              </div>
              <div>
                <h3 className="text-parchment/50 uppercase tracking-widest text-sm mb-2">Body (Inter / Sans)</h3>
                <div className="text-lg text-parchment/80 font-sans leading-relaxed">
                  Truth is not spoken. It is inscribed. A meticulous digital heraldry that weaves elegance, modern UX, and robust identity tokens into a continuous narrative.
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-primary/20 p-8 rounded-xl flex items-center justify-center flex-col text-center shadow-lg">
              <h3 className="text-muted-foreground uppercase tracking-widest text-sm mb-6 w-full text-left">Decorative Layer (Symbols)</h3>
              <div className="text-primary text-3xl tracking-[1em] mb-4">✦ ✧ ✶ ✷ ⚜ ❂ ☉</div>
              <div className="text-foreground text-xl font-serif">✦ Veritas ☼ ✦</div>
            </div>
          </div>
        </section>

        <section>
          <div className="border-b border-border pb-4 mb-8">
            <h2 className="ornate-border inline-block rounded-xl px-4 py-2 text-3xl font-serif text-foreground">Identity Badges</h2>
          </div>
          <SigilPreview />
        </section>

        <section>
          <div className="border-b border-border pb-4 mb-8">
            <h2 className="ornate-border inline-block rounded-xl px-4 py-2 text-3xl font-serif text-foreground">Stitch Design Concepts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">Brand Guidelines</div>
                 <img src="/brand-guidelines.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="Brand Guidelines Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">Sigil Builder</div>
                 <img src="/sigil-builder.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="Sigil Builder Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">Identity Badges</div>
                 <img src="/identity-badges.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="Identity Badges Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">The Eternal Credential Pass</div>
                 <img src="/brand/the-eternal-credential-pass-1.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="The Eternal Credential Pass Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">image.png</div>
                 <img src="/brand/image-png-2.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="image.png Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">Forge of Identity</div>
                 <img src="/brand/forge-of-identity-3.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="Forge of Identity Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">The Grand Archives</div>
                 <img src="/brand/the-grand-archives-4.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="The Grand Archives Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">Ritual Notification Modal</div>
                 <img src="/brand/ritual-notification-modal-5.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="Ritual Notification Modal Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">Ritual Notification Modal</div>
                 <img src="/brand/ritual-notification-modal-6.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="Ritual Notification Modal Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">The Eternal Credential Pass</div>
                 <img src="/brand/the-eternal-credential-pass-7.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="The Eternal Credential Pass Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">The Dashboard of Command</div>
                 <img src="/brand/the-dashboard-of-command-8.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="The Dashboard of Command Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">Generated Screen</div>
                 <img src="/brand/generated-screen-9.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="Generated Screen Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">image.png</div>
                 <img src="/brand/image-png-10.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="image.png Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">House of Veritas Sanctum</div>
                 <img src="/brand/house-of-veritas-sanctum-11.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="House of Veritas Sanctum Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">The Grand Forge of Creation</div>
                 <img src="/brand/the-grand-forge-of-creation-12.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="The Grand Forge of Creation Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">image.png</div>
                 <img src="/brand/image-png-13.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="image.png Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">The Grand Archives</div>
                 <img src="/brand/the-grand-archives-14.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="The Grand Archives Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">The Grand Archives</div>
                 <img src="/brand/the-grand-archives-15.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="The Grand Archives Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">Ritual Notification Modal</div>
                 <img src="/brand/ritual-notification-modal-16.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="Ritual Notification Modal Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">Ritual Notification Modal</div>
                 <img src="/brand/ritual-notification-modal-17.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="Ritual Notification Modal Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">image.png</div>
                 <img src="/brand/image-png-18.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="image.png Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">Ritual Notification Modal</div>
                 <img src="/brand/ritual-notification-modal-19.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="Ritual Notification Modal Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">image.png</div>
                 <img src="/brand/image-png-20.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="image.png Mockup" />
             </div>
             <div className="bg-card p-4 rounded-xl border border-border shadow-lg flex flex-col items-center">
                 <div className="font-serif text-xl text-primary mb-4 text-center">Ritual Notification Modal</div>
                 <img src="/brand/ritual-notification-modal-21.png" className="rounded-lg border border-primary/10 object-cover w-full h-[500px]" alt="Ritual Notification Modal Mockup" />
             </div>
          </div>
        </section>
      </div>
    </main>
  );
}
