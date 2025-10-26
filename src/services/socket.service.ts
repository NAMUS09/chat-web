import { io, Socket } from "socket.io-client";

export interface SocketEvents {
  // Message events
  "message:new": (data: any) => void;
  "message:status": (data: any) => void;

  // Typing events
  "typing:update": (data: any) => void;

  // Presence events
  "presence:change": (data: any) => void;

  // Connection events
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
  reconnect: (attemptNumber: number) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  /**
   * Initialize socket connection
   */
  connect(userId: string, username: string, role: string): Socket {
    if (this.socket?.connected) {
      //console.log("Socket already connected");
      return this.socket;
    }

    const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    this.socket = io(serverUrl, {
      auth: {
        userId,
        username,
        role,
      },
      // Reconnection strategy
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000,
      // Enable compression
      transports: ["websocket", "polling"],
    });

    this.setupEventHandlers();

    console.log("🔌 Socket connecting...");
    return this.socket;
  }

  /**
   * Setup default event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket?.id);
      this.reconnectAttempts = 0;
      //this.emit("connection");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      //this.emit("disconnect", reason);

      // Handle different disconnect reasons
      if (reason === "io server disconnect") {
        // Server disconnected, manually reconnect
        this.socket?.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      this.reconnectAttempts++;
      this.emit("connect_error", error);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.emit("reconnect", attemptNumber);
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed");
    });
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log("🛑 Socket disconnected manually");
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Emit event to server
   */
  emit(event: string, data?: any, callback?: (response: any) => void): void {
    if (!this.socket?.connected) {
      console.warn("Socket not connected, cannot emit:", event);
      return;
    }

    if (callback) {
      this.socket.emit(event, data, callback);
    } else {
      this.socket.emit(event, data);
    }
  }

  /**
   * Listen to event from server
   */
  on<K extends keyof SocketEvents>(event: K, handler: SocketEvents[K]): void;
  on(event: string, handler: Function): void {
    if (!this.socket) {
      console.warn("Socket not initialized");
      return;
    }

    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Register with socket
    this.socket.on(event, handler as any);
  }

  /**
   * Remove event listener
   */
  off(event: string, handler?: Function): void {
    if (!this.socket) return;

    if (handler) {
      this.socket.off(event, handler as any);
      this.listeners.get(event)?.delete(handler);
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  /**
   * Listen to event once
   */
  once(event: string, handler: Function): void {
    if (!this.socket) return;
    this.socket.once(event, handler as any);
  }

  /**
   * Send message
   */
  sendMessage(
    conversationId: string,
    receiverId: string,
    content: string,
    callback?: (response: any) => void
  ): void {
    this.emit(
      "message:send",
      { conversationId, receiverId, content },
      callback
    );
  }

  /**
   * Mark message as delivered
   */
  markMessageDelivered(messageId: string, conversationId: string): void {
    this.emit("message:delivered", { messageId, conversationId });
  }

  /**
   * Mark messages as read
   */
  markMessagesRead(messageIds: string[], conversationId: string): void {
    this.emit("message:read", { messageIds, conversationId });
  }

  /**
   * Send typing start
   */
  sendTypingStart(conversationId: string, receiverId?: string): void {
    this.emit("typing:start", { conversationId, receiverId });
  }

  /**
   * Send typing stop
   */
  sendTypingStop(conversationId: string, receiverId?: string): void {
    this.emit("typing:stop", { conversationId, receiverId });
  }

  /**
   * Join conversation room
   */
  joinConversation(conversationId: string): void {
    this.emit("conversation:join", conversationId);
  }

  /**
   * Leave conversation room
   */
  leaveConversation(conversationId: string): void {
    this.emit("conversation:leave", conversationId);
  }

  /**
   * Get message history
   */
  getMessageHistory(
    conversationId: string,
    limit?: number,
    offset?: number,
    callback?: (response: any) => void
  ): void {
    this.emit("messages:history", { conversationId, limit, offset }, callback);
  }

  /**
   * Update presence status
   */
  updatePresence(status: "online" | "offline" | "away"): void {
    this.emit("presence:update", status);
  }

  /**
   * Get presence for users
   */
  getPresence(userIds: string[], callback?: (response: any) => void): void {
    this.emit("presence:get", userIds, callback);
  }

  /**
   * Get single user presence
   */
  getSinglePresence(userId: string, callback?: (response: any) => void): void {
    this.emit("presence:get:single", userId, callback);
  }

  /**
   * Cleanup all listeners (call on unmount)
   */
  cleanup(): void {
    this.listeners.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        this.socket?.off(event, handler as any);
      });
    });
    this.listeners.clear();
  }
}

// Export singleton instance
export default new SocketService();
