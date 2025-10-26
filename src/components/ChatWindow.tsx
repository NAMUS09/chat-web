import { useConversationsQuery } from "@/hooks/queries/message";
import React, { useEffect } from "react";
import { useSocket, useSocketEvent } from "../hooks/useSocket";
import { useAppDispatch, useAppSelector } from "../store";
import {
  setInitialMessages,
  updateMessageStatus,
} from "../store/slices/messageSlice";
import ChatDetailHeader from "./chat/ChatDetailHeader";
import MessageBody from "./chat/MessageBody";
import MessageForm from "./chat/MessageForm";

interface ChatWindowProps {
  conversationId: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  participantId,
  participantName,
  participantAvatar,
}) => {
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector((state) => state.auth.user);

  const { data: initalData, isLoading } = useConversationsQuery(conversationId);

  const { isConnected, markAsRead, joinConversation } = useSocket(currentUser);

  useEffect(() => {
    if (!isLoading && initalData && initalData.messages) {
      const initialMessages = initalData.messages;

      // get unread messages to mark as read
      const unreadMessageIds =
        initialMessages
          ?.filter(
            (msg) =>
              msg.receiverId._id === currentUser?.id && msg.status !== "read"
          )
          ?.map((msg) => msg._id) ?? [];
      dispatch(
        setInitialMessages({
          conversationId,
          messages: initialMessages,
        })
      );
      if (isConnected && unreadMessageIds.length > 0) {
        markAsRead(unreadMessageIds, conversationId);
      }
    }
  }, [initalData, dispatch, isLoading, isConnected]);

  // Join conversation on mount
  useEffect(() => {
    if (isConnected && conversationId) {
      joinConversation(conversationId);
    }
  }, [isConnected, conversationId, joinConversation]);

  // Listen for message status updates
  useSocketEvent<any>("message:status", (data) => {
    if (data.conversationId === conversationId) {
      dispatch(
        updateMessageStatus({
          messageIds: Array.isArray(data.messageIds)
            ? data.messageIds
            : [data.messageId],
          status: data.status,
          conversationId: data.conversationId,
        })
      );
    }
  });

  return (
    <div className="flex flex-col h-full bg-white">
      <ChatDetailHeader
        participantId={participantId}
        participantName={participantName}
        participantAvatar={participantAvatar}
      />
      <MessageBody conversationId={conversationId} />
      <MessageForm
        conversationId={conversationId}
        participantId={participantId}
      />
    </div>
  );
};

export default ChatWindow;
