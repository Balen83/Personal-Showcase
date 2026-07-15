import {
  useListConversations,
  useCreateConversation,
  useListMessages,
  useCreateMessage,
  getListConversationsQueryKey,
  getListMessagesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Conversation, Message } from "@workspace/api-client-react";

export type { Conversation, Message };

const CONV_POLL = 6000;
const MSG_POLL = 3000;

export function useConversations(email?: string) {
  const enabled = !!email;
  const { data, isLoading } = useListConversations(
    { email: email ?? "" },
    {
      query: {
        queryKey: getListConversationsQueryKey({ email: email ?? "" }),
        enabled,
        refetchInterval: enabled ? CONV_POLL : false,
      },
    },
  );

  const createMutation = useCreateConversation();

  return {
    conversations: data ?? [],
    isLoaded: !enabled || !isLoading,
    startConversation: (input: {
      productId: number;
      productName: string;
      productImage: string;
      sellerEmail: string;
      sellerName?: string;
      buyerEmail: string;
      buyerName?: string;
    }) => createMutation.mutateAsync({ data: input }),
  };
}

export function useMessages(conversationId?: number) {
  const queryClient = useQueryClient();
  const enabled = !!conversationId;

  const { data, isLoading } = useListMessages(conversationId ?? -1, {
    query: {
      queryKey: getListMessagesQueryKey(conversationId ?? -1),
      enabled,
      refetchInterval: enabled ? MSG_POLL : false,
    },
  });

  const sendMutation = useCreateMessage({
    mutation: {
      onSuccess: () => {
        if (conversationId) {
          queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(conversationId) });
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
        }
      },
    },
  });

  return {
    messages: data ?? [],
    isLoaded: !enabled || !isLoading,
    sendMessage: (senderEmail: string, text: string) => {
      if (!conversationId) return Promise.reject(new Error("No conversation"));
      return sendMutation.mutateAsync({ id: conversationId, data: { senderEmail, text } });
    },
  };
}
