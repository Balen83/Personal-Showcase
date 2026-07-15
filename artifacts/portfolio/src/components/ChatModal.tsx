import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMessages } from "@/lib/conversations";
import { useLanguage } from "@/lib/language-context";
import { cn, formatDate } from "@/lib/utils";
import { Send } from "lucide-react";

export function ChatModal({
  open,
  onOpenChange,
  conversationId,
  productName,
  currentEmail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId?: number;
  productName?: string;
  currentEmail: string;
}) {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { messages, sendMessage } = useMessages(conversationId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !conversationId) return;
    setSending(true);
    try {
      await sendMessage(currentEmail, text.trim());
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="line-clamp-1">{t("chat.title", { name: productName ?? "" })}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-2 min-h-[240px] max-h-[380px]">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center px-6">
              {t("chat.empty")}
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.senderEmail.toLowerCase() === currentEmail.toLowerCase();
              return (
                <div
                  key={m.id}
                  className={cn("flex flex-col max-w-[80%]", mine ? (isRTL ? "self-start" : "self-end ml-auto") : (isRTL ? "self-end mr-auto" : "self-start"))}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2 text-sm leading-relaxed",
                      mine
                        ? "bg-[#D4AF37]/90 text-black"
                        : "bg-secondary/60 border border-border/50"
                    )}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {formatDate(m.createdAt)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-border/40">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("chat.placeholder")}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={sending || !text.trim()} aria-label={t("chat.send")}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
