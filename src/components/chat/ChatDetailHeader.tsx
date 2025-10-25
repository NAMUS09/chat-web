import { useSocketEvent } from "@/hooks/useSocket";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectTypingUsers,
  updateTypingIndicator,
} from "@/store/slices/messageSlice";
import { useParams } from "react-router-dom";
import Avatar from "../Avatar";

type ChatDetailHeaderProps = {
  participantName: string;
  participantAvatar?: string;
};

const ChatDetailHeader: React.FC<ChatDetailHeaderProps> = ({
  participantName,
  participantAvatar,
}) => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
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
    <div className="flex items-center gap-3 p-4 border-b bg-gray-50 h-16">
      <Avatar avatar={participantAvatar} displayName={participantName} />

      <div className="flex-1">
        <h2 className="font-semibold text-gray-900">{participantName}</h2>
        {typingUsers.length > 0 && (
          <p className="text-sm text-green-600">typing...</p>
        )}
      </div>
    </div>
  );
};

export default ChatDetailHeader;
