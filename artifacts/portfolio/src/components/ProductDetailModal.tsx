import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist";
import { useConversations } from "@/lib/conversations";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/products";
import { RoleBadge, VerifiedBadge } from "@/components/RoleBadge";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ChatModal } from "@/components/ChatModal";
import {
  Heart,
  MapPin,
  Share2,
  MessageCircle,
  ShoppingBag,
  Eye,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Pin,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
  onBuyNow,
  onEdit,
  onDelete,
  onToggleSold,
  onTogglePin,
  onToggleVerified,
  sellerRole,
  isModerator,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuyNow: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleSold: (product: Product) => void;
  onTogglePin: (product: Product) => void;
  onToggleVerified: (product: Product) => void;
  sellerRole?: string;
  isModerator: boolean;
}) {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { user, openAuthModal } = useAuth();
  const { isWishlisted, toggle } = useWishlist(user?.email);
  const { startConversation } = useConversations(user?.email);
  const [imgIndex, setImgIndex] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    setImgIndex(0);
  }, [product?.id]);

  const images = useMemo(() => {
    if (!product) return [];
    const list = [product.imageUrl, ...(product.images ?? [])].filter(Boolean);
    return Array.from(new Set(list));
  }, [product]);

  if (!product) return null;

  const isOwner = user?.email?.toLowerCase() === product.sellerEmail.toLowerCase();
  const pinActive = product.pinned && product.pinnedUntil && new Date(product.pinnedUntil).getTime() > Date.now();

  const handleChat = async () => {
    if (!user) {
      openAuthModal(t("auth.loginToChat"));
      return;
    }
    setStartingChat(true);
    try {
      const conv = await startConversation({
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        sellerEmail: product.sellerEmail,
        sellerName: product.sellerName ?? undefined,
        buyerEmail: user.email,
        buyerName: user.name ?? undefined,
      });
      setConversationId(conv.id);
      setChatOpen(true);
    } finally {
      setStartingChat(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
    } catch {}
    await navigator.clipboard.writeText(url);
    toast.success(t("share.copied"));
  };

  const handleWishlist = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    toggle(product.id);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <DialogTitle className="text-2xl">{product.name}</DialogTitle>
              <RoleBadge role={sellerRole} />
              {product.verified && <VerifiedBadge />}
            </div>
            <DialogDescription className="sr-only">{product.description}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative aspect-square rounded-xl bg-secondary/30 border border-border/40 overflow-hidden flex items-center justify-center p-4">
              <img
                src={images[imgIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain drop-shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/600x600/1a1a1a/404040?text=No+Image";
                }}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 border border-border/50 flex items-center justify-center",
                      isRTL ? "right-2" : "left-2"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 border border-border/50 flex items-center justify-center",
                      isRTL ? "left-2" : "right-2"
                    )}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
                    {images.map((_, i) => (
                      <span
                        key={i}
                        className={cn("w-1.5 h-1.5 rounded-full", i === imgIndex ? "bg-[#D4AF37]" : "bg-white/30")}
                      />
                    ))}
                  </div>
                </>
              )}
              {product.sold && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-lg font-bold border-2 border-white/80 text-white px-4 py-1 rotate-[-8deg]">
                    {t("product.sold")}
                  </span>
                </div>
              )}
              {pinActive && (
                <div className={cn("absolute top-2", isRTL ? "right-2" : "left-2")}>
                  <CountdownTimer until={product.pinnedUntil!} />
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold">{formatPrice(product.price, product.currency)}</span>
                <button onClick={handleWishlist} aria-label={t("wishlist.add")}>
                  <Heart className={cn("w-6 h-6", user && isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                </button>
              </div>

              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                {product.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {t(`location.${product.location}`) || product.location}
                  </span>
                )}
                {product.size && <span>{t("size.label")}: {product.size}</span>}
              </div>

              {product.conditionRating != null && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">{product.conditionRating}/10</span>{" "}
                  <span className="text-muted-foreground">{t("condition.label")}</span>
                </div>
              )}

              <p className="text-sm text-muted-foreground mt-4 leading-relaxed flex-1">{product.description}</p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                <Eye className="w-3.5 h-3.5" /> {t("product.views", { count: product.views })}
              </div>

              <div className="mt-5 space-y-2">
                {!product.sold && !isOwner && (
                  <Button className="w-full h-11" onClick={() => onBuyNow(product)}>
                    <ShoppingBag className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                    {t("checkout.buyNow")}
                  </Button>
                )}
                {!isOwner && (
                  <Button variant="secondary" className="w-full h-11" onClick={handleChat} disabled={startingChat}>
                    <MessageCircle className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                    {t("product.chatWithSeller")}
                  </Button>
                )}
                <Button variant="outline" className="w-full h-10" onClick={handleShare}>
                  <Share2 className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                  {t("share.title")}
                </Button>

                {isOwner && (
                  <div className="flex gap-2 pt-2 border-t border-border/40 mt-2">
                    <Button variant="secondary" className="flex-1 h-10" onClick={() => onEdit(product)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" className="flex-1 h-10" onClick={() => onToggleSold(product)}>
                      {product.sold ? t("product.markAvailable") : t("product.markSold")}
                    </Button>
                    <Button variant="destructive" className="flex-1 h-10" onClick={() => onDelete(product)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {!isOwner && isModerator && (
                  <div className="flex gap-2 pt-2 border-t border-border/40 mt-2">
                    <Button variant="secondary" className="flex-1 h-10" onClick={() => onTogglePin(product)}>
                      <Pin className="w-4 h-4 mr-1" />
                      {pinActive ? t("product.unpin") : t("product.pin")}
                    </Button>
                    <Button variant="secondary" className="flex-1 h-10" onClick={() => onToggleVerified(product)}>
                      <BadgeCheck className="w-4 h-4 mr-1" />
                      {product.verified ? "-" : "+"}
                    </Button>
                    <Button variant="destructive" className="flex-1 h-10" onClick={() => onDelete(product)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ChatModal
        open={chatOpen}
        onOpenChange={setChatOpen}
        conversationId={conversationId}
        productName={product.name}
        currentEmail={user?.email ?? ""}
      />
    </>
  );
}
