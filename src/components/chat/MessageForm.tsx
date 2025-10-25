import useSocket from "@/hooks/useSocket";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addMessage,
  setSendingMessage,
  updateMessage,
} from "@/store/slices/messageSlice";
import { useQueryClient } from "@tanstack/react-query";
import { Paperclip, Send, Smile } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  conversationId: string;
  participantId: string;
};

const MessageForm: React.FC<Props> = ({ conversationId, participantId }) => {
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  const { isConnected, sendMessage, startTyping, stopTyping } = useSocket(
    currentUser?.id,
    currentUser?.username,
    currentUser?.role
  );

  const typingTimeoutRef = useRef<any>(null);

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    // Send typing indicator
    if (value && !isTyping) {
      setIsTyping(true);
      startTyping(conversationId, participantId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(conversationId, participantId);
    }, 1000);
  };

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !isConnected) return;

    const content = messageInput.trim();
    setMessageInput("");

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      stopTyping(conversationId, participantId);
    }

    try {
      dispatch(setSendingMessage(true));

      // Optimistic update - add message immediately
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        conversationId,
        senderId: {
          _id: currentUser!.id,
          username: currentUser!.username,
          profile: currentUser!.profile,
        },
        receiverId: {
          _id: participantId,
        },
        content,
        status: "sent" as const,
        timestamp: new Date().toISOString(),
      };

      dispatch(addMessage(optimisticMessage));

      // Send via socket
      const response = await sendMessage(
        conversationId,
        participantId,
        content
      );

      // Replace optimistic message with real one
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: ["conversations", conversationId],
        });
        const realMsg = response.message;

        dispatch(
          updateMessage({
            conversationId,
            tempId: optimisticMessage._id,
            updatedMessage: realMsg,
          })
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // TODO: Show error notification
    } finally {
      dispatch(setSendingMessage(false));
    }
  };
  return (
    <form
      onSubmit={handleSendMessage}
      className="flex items-center gap-2 p-4 border-t bg-gray-50"
    >
      <button
        type="button"
        className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
      >
        <Paperclip size={20} />
      </button>
      <button
        type="button"
        className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
      >
        <Smile size={20} />
      </button>
      <input
        type="text"
        value={messageInput}
        onChange={handleInputChange}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={!isConnected}
      />
      <button
        type="submit"
        disabled={!messageInput.trim() || !isConnected}
        className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <Send size={20} />
      </button>
    </form>
  );
};

export default MessageForm;
