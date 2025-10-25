import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "..";

export interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    username: string;
    profile: {
      displayName: string;
      avatar?: string;
    };
  };
  receiverId: {
    _id: string;
    username?: string;
    profile?: {
      displayName: string;
      avatar?: string;
    };
  };
  content: string;
  status: "sent" | "delivered" | "read";
  timestamp: string;
  metadata?: {
    edited?: boolean;
    editedAt?: string;
  };
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  isTyping: boolean;
  typingUsers: string[];
}

interface MessageState {
  // Normalized messages: { [conversationId]: Message[] }
  messagesByConversation: Record<string, Message[]>;

  // Conversations list
  conversations: Conversation[];

  // Currently active conversation
  activeConversationId: string | null;

  // Typing indicators: { [conversationId]: string[] }
  typingIndicators: Record<string, string[]>;

  // Total unread count
  totalUnreadCount: number;

  // Loading states
  isLoadingMessages: boolean;
  isLoadingHistory: boolean;
  isSendingMessage: boolean;

  // Error state
  error: string | null;
}

const initialState: MessageState = {
  messagesByConversation: {},
  conversations: [],
  activeConversationId: null,
  typingIndicators: {},
  totalUnreadCount: 0,
  isLoadingMessages: false,
  isLoadingHistory: false,
  isSendingMessage: false,
  error: null,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    // Add new message (optimistic update)
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const convId = message.conversationId;

      if (!state.messagesByConversation[convId]) {
        state.messagesByConversation[convId] = [];
      }

      // Prevent duplicates
      const exists = state.messagesByConversation[convId].some(
        (m) => m._id === message._id
      );

      if (!exists) {
        state.messagesByConversation[convId].push(message);

        // Update conversation last message
        const conversation = state.conversations.find((c) => c.id === convId);
        if (conversation) {
          conversation.lastMessage = message;

          // Increment unread if message is from other user
          if (message.senderId._id !== conversation.participantId) {
            conversation.unreadCount++;
            state.totalUnreadCount++;
          }
        }
      }
    },

    updateMessage: (
      state,
      action: PayloadAction<{
        conversationId: string;
        tempId: string;
        updatedMessage: Message;
      }>
    ) => {
      const { conversationId, tempId, updatedMessage } = action.payload;
      const messages = state.messagesByConversation[conversationId];
      if (!messages) return;

      const index = messages.findIndex((m) => m._id === tempId);
      if (index !== -1) {
        messages[index] = {
          ...messages[index],
          ...updatedMessage,
        };
      }
    },
    // Add multiple messages (for history loading)
    addMessages: (
      state,
      action: PayloadAction<{ conversationId: string; messages: Message[] }>
    ) => {
      const { conversationId, messages } = action.payload;

      if (!state.messagesByConversation[conversationId]) {
        state.messagesByConversation[conversationId] = [];
      }

      // Prepend messages (history is loaded in reverse chronological order)
      state.messagesByConversation[conversationId] = [
        ...messages,
        ...state.messagesByConversation[conversationId],
      ];
    },

    setInitialMessages: (
      state,
      action: PayloadAction<{ conversationId: string; messages: Message[] }>
    ) => {
      const { conversationId, messages } = action.payload;
      state.messagesByConversation[conversationId] = messages;
    },

    // Update message status
    updateMessageStatus: (
      state,
      action: PayloadAction<{
        messageIds: string[];
        status: "sent" | "delivered" | "read";
        conversationId: string;
      }>
    ) => {
      const { messageIds, status, conversationId } = action.payload;
      const messages = state.messagesByConversation[conversationId];

      if (messages) {
        messages.forEach((msg) => {
          if (messageIds.includes(msg._id)) {
            msg.status = status;
          }
        });
      }
    },

    // Mark conversation as read
    markConversationAsRead: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      const conversation = state.conversations.find(
        (c) => c.id === conversationId
      );

      if (conversation && conversation.unreadCount > 0) {
        state.totalUnreadCount -= conversation.unreadCount;
        conversation.unreadCount = 0;
      }

      // Update message statuses
      const messages = state.messagesByConversation[conversationId];
      if (messages) {
        messages.forEach((msg) => {
          if (msg.status !== "read") {
            msg.status = "read";
          }
        });
      }
    },

    // Set active conversation
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
    },

    // Update typing indicator
    updateTypingIndicator: (
      state,
      action: PayloadAction<{
        conversationId: string;
        userId: string;
        username: string;
        isTyping: boolean;
      }>
    ) => {
      const { conversationId, username, isTyping } = action.payload;

      if (!state.typingIndicators[conversationId]) {
        state.typingIndicators[conversationId] = [];
      }

      if (isTyping) {
        // Add to typing users
        if (!state.typingIndicators[conversationId].includes(username)) {
          state.typingIndicators[conversationId].push(username);
        }
      } else {
        // Remove from typing users
        state.typingIndicators[conversationId] = state.typingIndicators[
          conversationId
        ].filter((u) => u !== username);
      }

      // Update conversation typing status
      const conversation = state.conversations.find(
        (c) => c.id === conversationId
      );
      if (conversation) {
        conversation.isTyping =
          state.typingIndicators[conversationId].length > 0;
        conversation.typingUsers = state.typingIndicators[conversationId];
      }
    },

    // Add or update conversation
    upsertConversation: (state, action: PayloadAction<Conversation>) => {
      const conversation = action.payload;
      const index = state.conversations.findIndex(
        (c) => c.id === conversation.id
      );

      if (index >= 0) {
        state.conversations[index] = conversation;
      } else {
        state.conversations.push(conversation);
      }
    },

    // Set conversations list
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;

      // Calculate total unread count
      state.totalUnreadCount = action.payload.reduce(
        (total, conv) => total + conv.unreadCount,
        0
      );
    },

    // Set loading states
    setLoadingMessages: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMessages = action.payload;
    },

    setLoadingHistory: (state, action: PayloadAction<boolean>) => {
      state.isLoadingHistory = action.payload;
    },

    setSendingMessage: (state, action: PayloadAction<boolean>) => {
      state.isSendingMessage = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Clear messages for conversation
    clearConversationMessages: (state, action: PayloadAction<string>) => {
      delete state.messagesByConversation[action.payload];
    },

    // Reset state
    resetMessageState: () => initialState,
  },
});

// Actions
export const {
  addMessage,
  updateMessage,
  addMessages,
  setInitialMessages,
  updateMessageStatus,
  markConversationAsRead,
  setActiveConversation,
  updateTypingIndicator,
  upsertConversation,
  setConversations,
  setLoadingMessages,
  setLoadingHistory,
  setSendingMessage,
  setError,
  clearConversationMessages,
  resetMessageState,
} = messageSlice.actions;

// Selectors
export const selectMessages = (state: RootState, conversationId: string) =>
  state.message.messagesByConversation[conversationId] || [];

export const selectConversations = (state: RootState) =>
  state.message.conversations;

export const selectActiveConversation = (state: RootState) => {
  if (!state.message.activeConversationId) return null;
  return state.message.conversations.find(
    (c) => c.id === state.message.activeConversationId
  );
};

export const selectTypingUsers = (state: RootState, conversationId: string) =>
  state.message.typingIndicators[conversationId] || [];

export const selectTotalUnreadCount = (state: RootState) =>
  state.message.totalUnreadCount;

export const selectIsLoading = (state: RootState) =>
  state.message.isLoadingMessages ||
  state.message.isLoadingHistory ||
  state.message.isSendingMessage;

export default messageSlice.reducer;
