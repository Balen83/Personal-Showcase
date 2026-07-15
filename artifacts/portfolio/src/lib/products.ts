import {
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useRecordProductView,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Product, ProductInput } from "@workspace/api-client-react";

export type { Product };

const POLL_INTERVAL = 4000;

export function useProducts() {
  const queryClient = useQueryClient();
  const queryKey = getListProductsQueryKey();

  const { data, isLoading } = useListProducts({
    query: { queryKey, refetchInterval: POLL_INTERVAL },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createMutation = useCreateProduct({ mutation: { onSuccess: invalidate } });
  const updateMutation = useUpdateProduct({ mutation: { onSuccess: invalidate } });
  const deleteMutation = useDeleteProduct({ mutation: { onSuccess: invalidate } });
  const viewMutation = useRecordProductView({ mutation: { onSuccess: invalidate } });

  return {
    products: data ?? [],
    isLoaded: !isLoading,
    addProduct: (input: ProductInput) => createMutation.mutateAsync({ data: input }),
    updateProduct: (id: number, data: Parameters<typeof updateMutation.mutateAsync>[0]["data"]) =>
      updateMutation.mutateAsync({ id, data }),
    deleteProduct: (id: number, actorEmail: string) => deleteMutation.mutateAsync({ id, data: { actorEmail } }),
    recordView: (id: number) => viewMutation.mutateAsync({ id }),
  };
}
