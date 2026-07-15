import {
  useListWishlist,
  useAddWishlistItem,
  useRemoveWishlistItem,
  getListWishlistQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const POLL_INTERVAL = 5000;

export function useWishlist(email?: string) {
  const queryClient = useQueryClient();
  const enabled = !!email;
  const queryKey = getListWishlistQueryKey({ email: email ?? "" });

  const { data, isLoading } = useListWishlist(
    { email: email ?? "" },
    { query: { queryKey, enabled, refetchInterval: enabled ? POLL_INTERVAL : false } },
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey });
  const addMutation = useAddWishlistItem({ mutation: { onSuccess: invalidate } });
  const removeMutation = useRemoveWishlistItem({ mutation: { onSuccess: invalidate } });

  const entries = data ?? [];
  const productIds = new Set(entries.map((entry) => entry.productId));

  return {
    entries,
    productIds,
    isLoaded: !enabled || !isLoading,
    isWishlisted: (productId: number) => productIds.has(productId),
    toggle: (productId: number) => {
      if (!email) return Promise.resolve();
      const existing = entries.find((entry) => entry.productId === productId);
      if (existing) {
        return removeMutation.mutateAsync({ id: existing.id });
      }
      return addMutation.mutateAsync({ data: { userEmail: email, productId } });
    },
  };
}
