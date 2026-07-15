import { RootLayout } from "@/components/layout/RootLayout";
import { useProducts } from "@/lib/products";
import type { Product } from "@/lib/products";
import { useOrders } from "@/lib/orders";
import { useConversations } from "@/lib/conversations";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { MapPin, Phone, User, Package, Calendar, Upload, ImageOff, Pencil, Trash2, MessageCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { fileToResizedBase64 } from "@/lib/image-utils";
import { EditProductDialog } from "@/components/EditProductDialog";
import { ChatModal } from "@/components/ChatModal";

export default function Seller() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { user, openAuthModal } = useAuth();
  const { orders } = useOrders(user?.email);
  const { conversations } = useConversations(user?.email);
  const [, setLocation] = useLocation();
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";

  const [tab, setTab] = useState<"sell" | "listings" | "orders" | "messages">("sell");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [chatConversationId, setChatConversationId] = useState<number | undefined>(undefined);
  const [chatProductName, setChatProductName] = useState<string | undefined>(undefined);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      openAuthModal(t("auth.loginToSell"));
      setLocation("/");
    }
  }, [user, setLocation, openAuthModal, t]);

  const formSchema = z.object({
    name: z.string().min(2, t("error.name")),
    price: z.coerce.number().positive(t("error.price")),
    currency: z.enum(["usd", "iqd"]).default("usd"),
    imageUrl: z.string().min(1, t("error.image")),
    images: z.array(z.string()).default([]),
    size: z.string().min(1, t("size.placeholder")),
    conditionRating: z.coerce.number().min(1).max(10).optional(),
    description: z.string().min(10, t("error.desc")),
    location: z.string().min(2, t("location.placeholder")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: undefined,
      currency: "usd",
      imageUrl: "",
      images: [],
      size: "",
      conditionRating: undefined,
      description: "",
      location: ""
    }
  });

  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = (data: FormValues) => {
    if (!user) return;

    return addProduct({
      ...data,
      sellerEmail: user.email,
      sellerName: user.name ?? undefined
    }).then(() => {
      toast.success(t("seller.toastTitle"), {
        description: t("seller.toastDesc", { name: data.name })
      });
      reset();
      setLocation("/");
    });
  };

  const myListings = products.filter((p) => p.sellerEmail === user?.email);
  const sellerOrders = orders;

  const handleToggleSold = async (product: Product) => {
    if (!user) return;
    await updateProduct(product.id, { actorEmail: user.email, sold: !product.sold });
  };

  const handleDelete = async (product: Product) => {
    if (!user) return;
    if (!window.confirm(t("product.deleteConfirm"))) return;
    await deleteProduct(product.id, user.email);
    toast.success(t("product.deleted"));
  };

  const handleEditSave = async (data: Parameters<NonNullable<Parameters<typeof EditProductDialog>[0]["onSave"]>>[0]) => {
    if (!user || !editProduct) return;
    await updateProduct(editProduct.id, { actorEmail: user.email, ...data });
  };

  const openConversation = (conv: { id: number; productName: string }) => {
    setChatConversationId(conv.id);
    setChatProductName(conv.productName);
    setChatOpen(true);
  };

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "sell", label: t("seller.tabSell") },
    { key: "listings", label: t("seller.tabListings") },
    { key: "orders", label: t("seller.tabOrders") },
    { key: "messages", label: t("seller.tabMessages") },
  ];

  if (!user) return null;

  return (
    <RootLayout>
      <div className="container mx-auto px-6 py-24 max-w-5xl">
        <div className="mb-2">
          <h1 className="font-serif text-4xl font-bold tracking-tight mb-2">{t("seller.title")}</h1>
          <p className="text-muted-foreground">{t("seller.subtitle")}</p>
        </div>

        <div className="flex gap-1 rounded-full bg-secondary/40 p-1 border border-border/50 my-8 w-fit overflow-x-auto">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap",
                tab === tb.key ? "bg-[#D4AF37] text-black" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {tab === "sell" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl">
            <Card className="border-border/50 bg-secondary/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t("seller.details")}</CardTitle>
                <CardDescription>{t("seller.fillOut")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("seller.nameLabel")}</Label>
                    <Input id="name" placeholder={t("seller.namePlaceholder")} {...register("name")} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price">{t("seller.priceLabel")}</Label>
                      <Input id="price" type="number" step="0.01" placeholder="0.00" {...register("price")} />
                      {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">{t("currency.label")}</Label>
                      <Controller
                        name="currency"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value} dir={dir}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="usd">{t("currency.usd")}</SelectItem>
                              <SelectItem value="iqd">{t("currency.iqd")}</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="size">{t("size.label")}</Label>
                      <Input id="size" placeholder={t("size.placeholder")} {...register("size")} />
                      {errors.size && <p className="text-sm text-destructive">{errors.size.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="conditionRating">{t("condition.label")}</Label>
                      <Input id="conditionRating" type="number" min={1} max={10} {...register("conditionRating")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">{t("location.label")}</Label>
                    <Controller
                      name="location"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value} dir={dir}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("location.placeholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="erbil">{t("location.erbil")}</SelectItem>
                            <SelectItem value="sulaymaniyah">{t("location.sulaymaniyah")}</SelectItem>
                            <SelectItem value="duhok">{t("location.duhok")}</SelectItem>
                            <SelectItem value="kirkuk">{t("location.kirkuk")}</SelectItem>
                            <SelectItem value="online">{t("location.online")}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">{t("seller.imageLabel")}</Label>
                    <Controller
                      name="imageUrl"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <input
                            ref={fileInputRef}
                            id="imageUrl"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsProcessingImage(true);
                              try {
                                const base64 = await fileToResizedBase64(file);
                                field.onChange(base64);
                              } catch {
                                toast.error(t("error.image"));
                              } finally {
                                setIsProcessingImage(false);
                              }
                            }}
                          />
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-4 rounded-md border border-dashed border-border bg-secondary/10 hover:bg-secondary/20 transition-colors p-3 cursor-pointer"
                          >
                            <div className="w-16 h-16 rounded-md bg-secondary/40 shrink-0 flex items-center justify-center overflow-hidden border border-border/40">
                              {field.value ? (
                                <img src={field.value} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <ImageOff className="w-6 h-6 text-muted-foreground opacity-60" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="inline-flex items-center gap-2 text-sm font-medium">
                                <Upload className="w-4 h-4" />
                                {isProcessingImage ? t("seller.uploadingPhoto") : field.value ? t("seller.changePhoto") : t("seller.uploadPhoto")}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{t("seller.uploadHint")}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    />
                    {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t("seller.descLabel")}</Label>
                    <Textarea id="description" placeholder={t("seller.descPlaceholder")} className="min-h-[120px]" {...register("description")} />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                  </div>

                  <Button type="submit" className="w-full h-12 text-lg font-medium bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90" disabled={isSubmitting}>
                    {isSubmitting ? t("seller.publishing") : t("seller.publish")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {tab === "listings" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
            {myListings.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-border rounded-xl bg-secondary/10">
                <p className="text-muted-foreground">{t("seller.myListingsEmpty")}</p>
              </div>
            ) : (
              myListings.map((p) => (
                <Card key={p.id} className="border-border/50 bg-secondary/10 overflow-hidden">
                  <div className="flex items-center p-4 gap-4">
                    <div className="w-16 h-16 rounded-md bg-secondary/50 shrink-0 flex items-center justify-center overflow-hidden border border-border/40 relative">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      {p.sold && <div className="absolute inset-0 bg-black/60" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-semibold text-sm line-clamp-1">{p.name}</h4>
                      <p className="text-sm font-medium mt-1">{formatPrice(p.price, p.currency)}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="icon" variant="secondary" onClick={() => setEditProduct(p)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleToggleSold(p)}>
                        {p.sold ? t("product.markAvailable") : t("product.markSold")}
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDelete(p)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </motion.div>
        )}

        {tab === "orders" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
            {sellerOrders.filter((o) => o.sellerEmail === user.email).length === 0 ? (
              <div className="py-16 text-center border border-dashed border-border rounded-xl bg-secondary/10">
                <Package className="w-10 h-10 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">{t("orders.empty")}</p>
              </div>
            ) : (
              sellerOrders.filter((o) => o.sellerEmail === user.email).map((order) => (
                <Card key={order.id} className="border-border/50 bg-secondary/10 overflow-hidden">
                  <div className="flex items-start p-4 border-b border-border/20">
                    <div className="w-16 h-16 rounded-md bg-secondary/50 shrink-0 flex items-center justify-center overflow-hidden border border-border/40">
                      <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100x100/1a1a1a/404040?text=No+Img" }} />
                    </div>
                    <div className={cn("flex-1", isRTL ? "mr-4" : "ml-4")}>
                      <h4 className="font-serif font-semibold text-sm line-clamp-1">{order.productName}</h4>
                      <p className="text-sm font-medium mt-1">{formatPrice(order.productPrice)}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3 mr-1 inline" />
                        <span>{t("orders.date", { date: formatDate(order.createdAt) })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-secondary/5 space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="leading-tight">{t("orders.buyerInfo", { name: order.buyerName })}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="leading-tight" dir="ltr">{order.buyerPhone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="leading-tight text-muted-foreground">{order.buyerAddress}</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </motion.div>
        )}

        {tab === "messages" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-3">
            {conversations.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-border rounded-xl bg-secondary/10">
                <p className="text-muted-foreground">{t("messages.empty")}</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const otherEmail = conv.sellerEmail === user.email ? conv.buyerEmail : conv.sellerEmail;
                const otherName = conv.sellerEmail === user.email ? conv.buyerName : conv.sellerName;
                return (
                  <Card key={conv.id} className="border-border/50 bg-secondary/10 p-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/20" onClick={() => openConversation(conv)}>
                    <div className="w-12 h-12 rounded-md bg-secondary/50 shrink-0 flex items-center justify-center overflow-hidden border border-border/40">
                      <img src={conv.productImage} alt={conv.productName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{conv.productName}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{otherName || otherEmail}</p>
                    </div>
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  </Card>
                );
              })
            )}
          </motion.div>
        )}
      </div>

      <EditProductDialog
        product={editProduct}
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
        onSave={handleEditSave}
      />

      <ChatModal
        open={chatOpen}
        onOpenChange={setChatOpen}
        conversationId={chatConversationId}
        productName={chatProductName}
        currentEmail={user.email}
      />
    </RootLayout>
  );
}
