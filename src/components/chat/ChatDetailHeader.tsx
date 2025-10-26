import { useSocketEvent } from "@/hooks/useSocket";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectTypingUsers,
  updateTypingIndicator,
} from "@/store/slices/messageSlice";
import { selectUserPresence } from "@/store/slices/presenceSlice";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { Link, useParams } from "react-router-dom";
import Avatar from "../Avatar";
import { Button } from "../ui/button";

type ChatDetailHeaderProps = {
  participantId: string;
  participantName: string;
  participantAvatar?: string;
};

const ChatDetailHeader: React.FC<ChatDetailHeaderProps> = ({
  participantId,
  participantName,
  participantAvatar,
}) => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const presence = useAppSelector((state) =>
    selectUserPresence(state, participantId)
  );
  const typingUsers = useAppSelector((state) => selectTypingUsers(state, id!));

  // Listen for typing indicators
  useSocketEvent<any>("typing:update", (data) => {
    if (data.conversationId === id) {
      dispatch(
        updateTypingIndicator({
          conversationId: data.conversationId,
          userId: data.userId,
          username: data.username,
          isTyping: data.isTyping,
        })
      );
    }
  });

  return (
    <div className="flex items-center gap-2 bg-gray-50 h-16 border-b px-0 md:px-4 py-4">
      <Link to="/chat" className="block md:hidden">
        <Button variant={"ghost"} size="default">
          <ArrowLeft />
        </Button>
      </Link>
      <div className="flex items-center gap-3">
        <Avatar
          userId={participantId}
          avatar={participantAvatar}
          displayName={participantName}
        />

        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{participantName}</h2>

          {typingUsers.length > 0 ? (
            <p className="text-sm text-green-600">typing...</p>
          ) : (
            <p className="text-sm text-gray-500 capitalize">
              {presence?.status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDetailHeader;
