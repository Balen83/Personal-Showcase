import { useProducts } from "@/lib/store";
import { formatPrice, cn } from "@/lib/utils";
import { RootLayout } from "@/components/layout/RootLayout";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { products, isLoaded } = useProducts();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (!isLoaded) return null;

  return (
    <RootLayout>
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-background to-background pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center rounded-full border border-border/50 bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-6 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              New arrivals daily
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6">
              COVETED.<br className="hidden md:block"/> CURATED.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The premier destination for authenticated premium sneakers. Buy, sell, and discover the most sought-after silhouettes in the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="container mx-auto px-6 pb-24">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif text-3xl font-bold tracking-tight">Trending Now</h2>
          <span className="text-sm text-muted-foreground hidden sm:inline-block">Showing {products.length} pairs</span>
        </div>
        
        {products.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">No sneakers listed yet.</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {products.map((product) => (
              <motion.div 
                key={product.id} 
                variants={item}
                className="group cursor-pointer flex flex-col"
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
                data-testid={`card-product-${product.id}`}
              >
                <div className="relative aspect-square rounded-xl bg-secondary/30 border border-border/40 overflow-hidden mb-4 p-6 transition-colors group-hover:bg-secondary/50 group-hover:border-border/80 flex items-center justify-center">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="max-w-[120%] max-h-[120%] object-contain filter drop-shadow-2xl transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-110 group-hover:-rotate-3"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x600/1a1a1a/404040?text=No+Image";
                    }}
                  />
                  
                  {/* Hover Overlay */}
                  <div className={cn(
                    "absolute top-4 right-4 w-10 h-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center border border-border/50 transition-all duration-300",
                    hoveredId === product.id ? "opacity-100 scale-100" : "opacity-0 scale-90"
                  )}>
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-serif text-lg font-semibold leading-tight line-clamp-1">{product.name}</h3>
                    <span className="font-medium whitespace-nowrap">{formatPrice(product.price)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </RootLayout>
  );
}