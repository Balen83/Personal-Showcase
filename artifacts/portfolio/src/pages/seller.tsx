import { RootLayout } from "@/components/layout/RootLayout";
import { useProducts } from "@/lib/store";
import { useOrders } from "@/lib/orders";
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
import { MapPin, Phone, User, Package, Calendar } from "lucide-react";
import { useEffect } from "react";

export default function Seller() {
  const { addProduct } = useProducts();
  const { orders } = useOrders();
  const { user, openAuthModal } = useAuth();
  const [, setLocation] = useLocation();
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      openAuthModal(t("auth.loginToSell"));
      setLocation("/");
    }
  }, [user, setLocation, openAuthModal, t]);

  const formSchema = z.object({
    name: z.string().min(2, t("error.name")),
    price: z.coerce.number().positive(t("error.price")),
    imageUrl: z.string().url(t("error.url")),
    description: z.string().min(10, t("error.desc")),
    location: z.string().min(2, t("location.placeholder")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: undefined,
      imageUrl: "",
      description: "",
      location: ""
    }
  });

  const onSubmit = (data: FormValues) => {
    if (!user) return;
    
    return new Promise(resolve => setTimeout(resolve, 600)).then(() => {
      addProduct({
        ...data,
        sellerEmail: user.email,
        sellerName: user.name
      });
      toast.success(t("seller.toastTitle"), {
        description: t("seller.toastDesc", { name: data.name })
      });
      setLocation("/");
    });
  };

  const sellerOrders = orders.filter(o => o.sellerEmail === user?.email);

  if (!user) return null;

  return (
    <RootLayout>
      <div className="container mx-auto px-6 py-24 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Seller Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7"
          >
            <div className="mb-8">
              <h1 className="font-serif text-4xl font-bold tracking-tight mb-2">{t("seller.title")}</h1>
              <p className="text-muted-foreground">{t("seller.subtitle")}</p>
            </div>

            <Card className="border-border/50 bg-secondary/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{t("seller.details")}</CardTitle>
                <CardDescription>{t("seller.fillOut")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("seller.nameLabel")}</Label>
                    <Input 
                      id="name" 
                      placeholder={t("seller.namePlaceholder")} 
                      {...register("name")}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price">{t("seller.priceLabel")}</Label>
                      <div className="relative">
                        <span className={cn(
                          "absolute top-1/2 -translate-y-1/2 text-muted-foreground",
                          isRTL ? "right-3" : "left-3"
                        )}>$</span>
                        <Input 
                          id="price" 
                          type="number" 
                          step="0.01" 
                          className={isRTL ? "pr-7 text-left font-sans" : "pl-7"} 
                          placeholder="0.00"
                          {...register("price")}
                        />
                      </div>
                      {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">{t("seller.imageLabel")}</Label>
                    <Input 
                      id="imageUrl" 
                      placeholder={t("seller.imagePlaceholder")}
                      className="text-left font-sans"
                      dir="ltr"
                      {...register("imageUrl")}
                    />
                    {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t("seller.descLabel")}</Label>
                    <Textarea 
                      id="description" 
                      placeholder={t("seller.descPlaceholder")}
                      className="min-h-[120px]"
                      {...register("description")}
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-medium" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t("seller.publishing") : t("seller.publish")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Orders Received Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="mb-8">
              <h2 className="font-serif text-3xl font-bold tracking-tight mb-2">{t("orders.title")}</h2>
              <p className="text-muted-foreground">{sellerOrders.length} {t("orders.title")}</p>
            </div>

            <div className="space-y-4">
              {sellerOrders.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-border rounded-xl bg-secondary/10">
                  <Package className="w-10 h-10 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">{t("orders.empty")}</p>
                </div>
              ) : (
                sellerOrders.map(order => (
                  <Card key={order.id} className="border-border/50 bg-secondary/10 overflow-hidden">
                    <div className="flex items-start p-4 border-b border-border/20">
                      <div className="w-16 h-16 rounded-md bg-secondary/50 shrink-0 flex items-center justify-center overflow-hidden border border-border/40">
                        <img 
                          src={order.productImage} 
                          alt={order.productName} 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100x100/1a1a1a/404040?text=No+Img" }}
                        />
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
            </div>
          </motion.div>
        </div>
      </div>
    </RootLayout>
  );
}