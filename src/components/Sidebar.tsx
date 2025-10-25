import { useAvailableUsersQuery } from "@/hooks/queries/auth";
import { cn, getConversationId } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { useNavigate, useParams } from "react-router-dom";
import Avatar from "./Avatar";

const ChatBox = ({ contact }: { contact: any }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const conversationId = getConversationId(user!.id!, contact._id);

  const isSelected = id === conversationId;
  const handleSelectContact = () => {
    navigate(`/chat/${conversationId}`);
  };

  return (
    <button
      key={contact._id}
      onClick={handleSelectContact}
      className={cn("w-full p-4 text-left hover:bg-gray-100", {
        "bg-gray-100": isSelected,
      })}
    >
      <div className="flex items-center gap-3">
        <Avatar
          avatar={contact.profile.avatar}
          displayName={contact.profile.displayName}
        />
        <span>{contact.profile.displayName}</span>
      </div>
    </button>
  );
};

const ChatList = () => {
  const { data, isLoading } = useAvailableUsersQuery();

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div>
      {data?.users.map((contact) => (
        <ChatBox key={contact._id} contact={contact} />
      ))}
    </div>
  );
};

export default function Sidebar() {
  return (
    <div className="w-80 bg-white border-r">
      <div className="p-4 border-b h-16">
        <h2 className="text-xl font-bold">Chats</h2>
      </div>
      <ChatList />
    </div>
  );
}
