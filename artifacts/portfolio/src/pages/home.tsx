import { useProducts } from "@/lib/products";
import type { Product } from "@/lib/products";
import { formatPrice, cn } from "@/lib/utils";
import { RootLayout } from "@/components/layout/RootLayout";
import { motion } from "framer-motion";
import { MapPin, ShoppingBag, Eye, Heart, Sparkles, Leaf } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useOrders } from "@/lib/orders";
import { useWishlist } from "@/lib/wishlist";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { EditProductDialog } from "@/components/EditProductDialog";
import { CountdownTimer } from "@/components/CountdownTimer";
import { RoleBadge, VerifiedBadge } from "@/components/RoleBadge";
import { useListUsers } from "@workspace/api-client-react";

function isPinActive(product: Product) {
  return !!product.pinned && !!product.pinnedUntil && new Date(product.pinnedUntil).getTime() > Date.now();
}

export default function Home() {
  const { products, isLoaded, updateProduct, deleteProduct, recordView } = useProducts();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const { t, dir } = useLanguage();
  const { user, openAuthModal } = useAuth();
  const { addOrder } = useOrders();
  const { isWishlisted, toggle } = useWishlist(user?.email);
  const { data: users } = useListUsers();

  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [buyerName, setBuyerName] = useState(user?.name || "");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRTL = dir === "rtl";
  const isModerator = user?.role === "admin" || user?.role === "super_admin";

  const roleForSeller = (email: string) => users?.find((u) => u.email.toLowerCase() === email.toLowerCase())?.role;

  const pinnedProducts = products.filter(isPinActive);
  const restProducts = products.filter((p) => !isPinActive(p));

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  const handleBuyClick = (product: Product) => {
    if (!user) {
      openAuthModal(t("auth.loginToBuy"));
    } else {
      setBuyerName(user.name || "");
      setBuyerPhone("");
      setBuyerAddress("");
      setCheckoutProduct(product);
      setDetailProduct(null);
    }
  };

  const openDetail = (product: Product) => {
    setDetailProduct(product);
    recordView(product.id).catch(() => {});
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !checkoutProduct) return;
    setIsSubmitting(true);
    addOrder({
      productId: checkoutProduct.id,
      productName: checkoutProduct.name,
      productPrice: checkoutProduct.price,
      productImage: checkoutProduct.imageUrl,
      sellerEmail: checkoutProduct.sellerEmail,
      buyerEmail: user.email,
      buyerName,
      buyerPhone,
      buyerAddress,
    })
      .then(() => {
        toast.success(t("checkout.successTitle"), {
          description: t("checkout.successDesc", { name: checkoutProduct.name }),
        });
        setCheckoutProduct(null);
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleToggleSold = async (product: Product) => {
    if (!user) return;
    await updateProduct(product.id, { actorEmail: user.email, sold: !product.sold });
    setDetailProduct((prev) => (prev ? { ...prev, sold: !prev.sold } : prev));
  };

  const handleTogglePin = async (product: Product) => {
    if (!user) return;
    const nowPinned = isPinActive(product);
    await updateProduct(product.id, { actorEmail: user.email, pinned: !nowPinned, pinHours: 12 });
    setDetailProduct(null);
  };

  const handleToggleVerified = async (product: Product) => {
    if (!user) return;
    await updateProduct(product.id, { actorEmail: user.email, verified: !product.verified });
    setDetailProduct((prev) => (prev ? { ...prev, verified: !prev.verified } : prev));
  };

  const handleDelete = async (product: Product) => {
    if (!user) return;
    if (!window.confirm(t("product.deleteConfirm"))) return;
    await deleteProduct(product.id, user.email);
    setDetailProduct(null);
    toast.success(t("product.deleted"));
  };

  const handleEditSave = async (data: Parameters<NonNullable<Parameters<typeof EditProductDialog>[0]["onSave"]>>[0]) => {
    if (!user || !editProduct) return;
    await updateProduct(editProduct.id, { actorEmail: user.email, ...data });
  };

  const renderCard = (product: Product, pinned: boolean) => (
    <motion.div
      key={product.id}
      variants={item}
      className="group flex flex-col relative"
      onMouseEnter={() => setHoveredId(product.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <div
        onClick={() => openDetail(product)}
        className={cn(
          "relative aspect-square rounded-xl overflow-hidden mb-4 p-6 flex items-center justify-center cursor-pointer glass-card",
          pinned && "ring-1 ring-[#D4AF37]/50"
        )}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="max-w-[120%] max-h-[120%] object-contain filter drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/600x600/1a1a1a/404040?text=No+Image";
          }}
        />

        {product.sold && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-sm font-bold border-2 border-white/80 text-white px-3 py-1 rotate-[-8deg]">
              {t("product.sold")}
            </span>
          </div>
        )}

        {pinned && product.pinnedUntil && (
          <div className={cn("absolute top-4 bg-background/85 backdrop-blur-md rounded-full px-2.5 py-1 border border-[#D4AF37]/40", isRTL ? "left-4" : "right-4")}>
            <CountdownTimer until={product.pinnedUntil} />
          </div>
        )}

        {product.location && (
          <div className={cn(
            "absolute top-4 bg-background/80 backdrop-blur-md rounded-full px-3 py-1 flex items-center border border-border/50 text-xs font-medium",
            isRTL ? "right-4" : "left-4"
          )}>
            <MapPin className={cn("w-3 h-3 text-muted-foreground", isRTL ? "ml-1" : "mr-1")} />
            {t(`location.${product.location}`) || product.location}
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!user) {
              openAuthModal();
              return;
            }
            toggle(product.id);
          }}
          className={cn(
            "absolute bottom-4 w-9 h-9 rounded-full bg-background/85 backdrop-blur-md flex items-center justify-center border border-border/50 transition-all",
            isRTL ? "left-4" : "right-4"
          )}
        >
          <Heart className={cn("w-4 h-4", user && isWishlisted(product.id) ? "fill-red-500 text-red-500" : "")} />
        </button>

        <div className={cn(
          "absolute bottom-4 left-4 right-4 flex transition-all duration-300",
          hoveredId === product.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          {!product.sold && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleBuyClick(product);
              }}
              className="w-full shadow-lg h-11 bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
            >
              <ShoppingBag className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
              {t("checkout.buyNow")}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-1 flex-1 px-1">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="font-serif text-lg font-semibold leading-tight line-clamp-1">{product.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <RoleBadge role={roleForSeller(product.sellerEmail)} />
              {product.verified && <VerifiedBadge />}
            </div>
          </div>
          <span className="font-medium whitespace-nowrap">{formatPrice(product.price, product.currency)}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
          {product.size && <span>{t("size.label")}: {product.size}</span>}
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3 h-3" /> {t("product.views", { count: product.views })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
          {product.description}
        </p>
      </div>
    </motion.div>
  );

  if (!isLoaded) return null;

  return (
    <RootLayout>
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-background to-background pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center rounded-full border border-[#D4AF37]/30 bg-secondary/50 px-3 py-1 text-xs font-medium text-[#D4AF37] mb-6 backdrop-blur-sm">
              <span className={cn("flex h-2 w-2 rounded-full bg-[#D4AF37]", isRTL ? "ml-2" : "mr-2")}></span>
              {t("hero.tag")}
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6" dangerouslySetInnerHTML={{ __html: t("hero.title") }} />
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {pinnedProducts.length > 0 && (
        <section className="container mx-auto px-6 pb-16">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif text-3xl font-bold tracking-tight text-gold">{t("pinned.title")}</h2>
          </div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {pinnedProducts.map((p) => renderCard(p, true))}
          </motion.div>
        </section>
      )}

      <section className="container mx-auto px-6 pb-24">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif text-3xl font-bold tracking-tight">{t("trending.title")}</h2>
          <span className="text-sm text-muted-foreground hidden sm:inline-block">{t("trending.count", { count: restProducts.length })}</span>
        </div>

        {restProducts.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">{t("trending.empty")}</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {restProducts.map((p) => renderCard(p, false))}
          </motion.div>
        )}
      </section>

      <section className="container mx-auto px-6 pb-24">
        <div className="glass-card rounded-2xl p-10 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gold">{t("about.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("about.body")}</p>
          </div>
          <div className="space-y-4">
            {["about.point1", "about.point2", "about.point3"].map((key) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <span className="text-sm font-medium">{t(key)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={!!checkoutProduct} onOpenChange={(open) => !open && setCheckoutProduct(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("checkout.title")}</DialogTitle>
            <DialogDescription>
              {checkoutProduct ? t("checkout.subtitle", { name: checkoutProduct.name }) : ""}
            </DialogDescription>
          </DialogHeader>

          {checkoutProduct && (
            <div className="flex items-center gap-4 py-4 border-b border-border/40">
              <div className="w-16 h-16 rounded-md bg-secondary/50 flex items-center justify-center p-2">
                <img src={checkoutProduct.imageUrl} alt={checkoutProduct.name} className="max-w-full max-h-full object-contain drop-shadow-md" />
              </div>
              <div>
                <p className="font-serif font-medium">{checkoutProduct.name}</p>
                <p className="text-lg font-semibold mt-1">{formatPrice(checkoutProduct.price, checkoutProduct.currency)}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="buyerName">{t("checkout.name")}</Label>
              <Input id="buyerName" required value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyerPhone">{t("checkout.phone")}</Label>
              <Input id="buyerPhone" required dir="ltr" className="text-left font-sans" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyerAddress">{t("checkout.address")}</Label>
              <Input id="buyerAddress" required value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} />
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                {isSubmitting ? "..." : t("checkout.submit")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ProductDetailModal
        product={detailProduct}
        open={!!detailProduct}
        onOpenChange={(open) => !open && setDetailProduct(null)}
        onBuyNow={handleBuyClick}
        onEdit={(p) => {
          setDetailProduct(null);
          setEditProduct(p);
        }}
        onDelete={handleDelete}
        onToggleSold={handleToggleSold}
        onTogglePin={handleTogglePin}
        onToggleVerified={handleToggleVerified}
        sellerRole={detailProduct ? roleForSeller(detailProduct.sellerEmail) : undefined}
        isModerator={isModerator}
      />

      <EditProductDialog
        product={editProduct}
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
        onSave={handleEditSave}
      />
    </RootLayout>
  );
}
