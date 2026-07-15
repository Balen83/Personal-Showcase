import { useListOrders, useCreateOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Order } from "@workspace/api-client-react";

export type { Order };

const POLL_INTERVAL = 5000;

export function useOrders(email?: string) {
  const queryClient = useQueryClient();
  const enabled = !!email;

  const { data, isLoading } = useListOrders(
    { email: email ?? "" },
    {
      query: {
        queryKey: getListOrdersQueryKey({ email: email ?? "" }),
        enabled,
        refetchInterval: enabled ? POLL_INTERVAL : false,
      },
    },
  );

  const createMutation = useCreateOrder({
    mutation: {
      onSuccess: () => {
        if (email) queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey({ email }) });
      },
    },
  });

  return {
    orders: data ?? [],
    isLoaded: !enabled || !isLoading,
    addOrder: (input: {
      productId: number;
      productName: string;
      productPrice: number;
      productImage: string;
      sellerEmail: string;
      buyerEmail: string;
      buyerName: string;
      buyerPhone: string;
      buyerAddress: string;
    }) => createMutation.mutateAsync({ data: input }),
  };
}
