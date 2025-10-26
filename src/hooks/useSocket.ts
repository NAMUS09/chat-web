import type { User } from "@/store/slices/authSlice";
import { useCallback, useEffect, useRef, useState } from "react";
import socketService, { type SocketEvents } from "../services/socket.service";

interface UseSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
}

interface UseSocketReturn {
  isConnected: boolean;
  socket: typeof socketService;
  sendMessage: (
    conversationId: string,
    receiverId: string,
    content: string
  ) => Promise<any>;
  markAsDelivered: (messageId: string, conversationId: string) => void;
  markAsRead: (messageIds: string[], conversationId: string) => void;
  startTyping: (conversationId: string, receiverId?: string) => void;
  stopTyping: (conversationId: string, receiverId?: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  getPresence: (
    userIds: string[],
    callback?: ((response: any) => void) | undefined
  ) => void;
  getSinglePresence: (
    userId: string,
    callback?: ((response: any) => void) | undefined
  ) => void;
}

export const useSocket = (
  user: User | null,
  options: UseSocketOptions = {}
): UseSocketReturn => {
  const { id: userId, username, role } = user || {};
  const [isConnected, setIsConnected] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const { autoConnect = true, onConnect, onDisconnect, onError } = options;

  // Initialize socket connection
  useEffect(() => {
    if (!autoConnect || !userId || !username || !role) return;

    // Connect to socket
    socketService.connect(userId, username, role);

    if (socketService.isConnected()) {
      setIsConnected(true);
    }

    // Setup connection event listeners
    const handleConnect = () => {
      setIsConnected(true);
      onConnect?.();
    };

    const handleDisconnect = (reason: string) => {
      setIsConnected(false);
      onDisconnect?.(reason);
    };

    const handleError = (error: Error) => {
      onError?.(error);
    };

    socketService.on("connect", handleConnect);
    socketService.on("disconnect", handleDisconnect);
    socketService.on("connect_error", handleError);

    // Cleanup on unmount
    return () => {
      socketService.off("connect", handleConnect);
      socketService.off("disconnect", handleDisconnect);
      socketService.off("connect_error", handleError);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [userId, username, role, autoConnect, onConnect, onDisconnect, onError]);

  /**
   * Send message with promise-based callback
   * Enables optimistic UI updates
   */
  const sendMessage = useCallback(
    (
      conversationId: string,
      receiverId: string,
      content: string
    ): Promise<any> => {
      return new Promise((resolve, reject) => {
        if (!isConnected) {
          reject(new Error("Socket not connected"));
          return;
        }

        socketService.sendMessage(
          conversationId,
          receiverId,
          content,
          (response) => {
            if (response.success) {
              resolve(response);
            } else {
              reject(new Error(response.error || "Failed to send message"));
            }
          }
        );

        // Timeout after 10 seconds
        setTimeout(() => {
          reject(new Error("Message send timeout"));
        }, 10000);
      });
    },
    [isConnected]
  );

  /**
   * Mark message as delivered
   */
  const markAsDelivered = useCallback(
    (messageId: string, conversationId: string) => {
      if (!isConnected) return;
      socketService.markMessageDelivered(messageId, conversationId);
    },
    [isConnected]
  );

  /**
   * Mark messages as read
   */
  const markAsRead = useCallback(
    (messageIds: string[], conversationId: string) => {
      if (!isConnected || messageIds.length === 0) return;
      socketService.markMessagesRead(messageIds, conversationId);
    },
    [isConnected]
  );

  /**
   * Start typing indicator
   * Auto-debounced on client side
   */
  const startTyping = useCallback(
    (conversationId: string, receiverId?: string) => {
      if (!isConnected) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing start
      socketService.sendTypingStart(conversationId, receiverId);

      // Auto-stop after 3 seconds if no activity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(conversationId, receiverId);
      }, 3000);
    },
    [isConnected]
  );

  /**
   * Stop typing indicator
   */
  const stopTyping = useCallback(
    (conversationId: string, receiverId?: string) => {
      if (!isConnected) return;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      socketService.sendTypingStop(conversationId, receiverId);
    },
    [isConnected]
  );

  /**
   * Join conversation room for real-time updates
   */
  const joinConversation = useCallback(
    (conversationId: string) => {
      if (!isConnected) return;
      socketService.joinConversation(conversationId);
    },
    [isConnected]
  );

  /**
   * Leave conversation room
   */
  const leaveConversation = useCallback(
    (conversationId: string) => {
      if (!isConnected) return;
      socketService.leaveConversation(conversationId);
    },
    [isConnected]
  );

  /**
   * Get User Presence
   */
  const getSinglePresence = useCallback(
    (userId: string, callback?: (response: any) => void) => {
      if (!isConnected) return;
      socketService.getSinglePresence(userId, callback);
    },
    [isConnected]
  );

  /**
   * Get Presence
   */
  const getPresence = useCallback(
    (userIds: string[], callback?: (response: any) => void) => {
      if (!isConnected) return;

      socketService.getPresence(userIds, callback);
    },
    [isConnected]
  );

  return {
    isConnected,
    socket: socketService,
    sendMessage,
    markAsDelivered,
    markAsRead,
    startTyping,
    stopTyping,
    joinConversation,
    leaveConversation,
    getSinglePresence,
    getPresence,
  };
};

/**
 * Hook for listening to specific socket events
 */
export const useSocketEvent = <T = any>(
  event: keyof SocketEvents,
  handler: (data: T) => void,
  dependencies: any[] = []
) => {
  useEffect(() => {
    socketService.on(event, handler);

    return () => {
      socketService.off(event, handler);
    };
  }, [event, ...dependencies]);
};

export default useSocket;
