import ChatWindow from "@/components/ChatWindow";
import { useAvailableUsersQuery } from "@/hooks/queries/auth";
import { getConversationId } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { useParams } from "react-router-dom";

const ChatDetailPage = () => {
  const { id } = useParams();

  const currrentUser = useAppSelector((state) => state.auth.user);
  const { data, isLoading } = useAvailableUsersQuery();

  if (isLoading) return <div className="p-4">Loading...</div>;
  const selectedContact = data?.users.find(
    (user) => getConversationId(currrentUser!.id, user._id) === id
  );

  if (!selectedContact) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Contact not found.</p>
      </div>
    );
  }

  return (
    <ChatWindow
      conversationId={id!}
      participantId={selectedContact._id}
      participantName={selectedContact.profile.displayName}
      participantAvatar={selectedContact.profile.avatar}
    />
  );
};

export default ChatDetailPage;
