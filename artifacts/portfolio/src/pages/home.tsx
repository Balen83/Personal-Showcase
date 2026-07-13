import React from 'react';

export default function Home() {
  const hobbies = [
    {
      title: "Through the Lens",
      category: "Film Photography",
      description: "There is a unique magic in analog photography. I spend my weekends walking through the city, capturing quiet moments on 35mm film. The anticipation of waiting for scans to develop teaches me patience and presence."
    },
    {
      title: "The Art of Sourdough",
      category: "Artisan Baking",
      description: "What started as a simple curiosity has turned into a weekend ritual. I love the tactile process of mixing flour and water, watching it ferment, and the unmatched aroma of a freshly baked loaf filling the kitchen."
    },
    {
      title: "Finding the Summits",
      category: "Mountain Hiking",
      description: "The best way to clear my mind is to head up into the mountains. I try to explore a new trail every month, breathing in the crisp alpine air and enjoying the perspective that only high altitudes can provide."
    },
    {
      title: "Collecting Sounds",
      category: "Jazz & Vinyl",
      description: "My evenings are often soundtracked by the crackle of a record player. Building a curated collection of jazz and soul vinyl has been a slow, deeply rewarding journey in active listening."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Container */}
      <main className="max-w-3xl mx-auto px-6 py-24 md:py-32">
        
        {/* Header Section */}
        <header className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-both">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-8 text-foreground">
            Welcome to my website
          </h1>
          <div className="space-y-6 text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-2xl">
            <p>
              I am a designer and developer who believes in the power of simplicity. 
              This is a small corner of the internet where I share the things that 
              bring me joy away from the keyboard.
            </p>
            <p>
              Take a look around and explore what keeps me inspired.
            </p>
          </div>
        </header>

        {/* Divider */}
        <div className="h-px w-full bg-border my-16 md:my-24 opacity-50 animate-in fade-in duration-1000 delay-300 fill-mode-both" />

        {/* Hobbies Section */}
        <section className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
          <h2 className="text-2xl font-medium text-foreground/80 mb-10">
            A few things I love
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {hobbies.map((hobby, index) => (
              <div 
                key={hobby.title} 
                className="group flex flex-col space-y-4 p-6 rounded-2xl bg-card border border-card-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">
                    {hobby.category}
                  </span>
                  <h3 className="text-xl font-medium text-card-foreground">
                    {hobby.title}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {hobby.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-32 pb-12 pt-8 border-t border-border opacity-50 text-sm text-center md:text-left text-muted-foreground animate-in fade-in duration-1000 delay-700 fill-mode-both">
          <p>Designed with intention and care.</p>
        </footer>

      </main>
    </div>
  );
}
