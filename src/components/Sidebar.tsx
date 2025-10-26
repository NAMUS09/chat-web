import {
  useAvailableUsersQuery,
  useLogoutMutation,
} from "@/hooks/queries/auth";
import { cn, getConversationId } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearUser } from "@/store/slices/authSlice";
import { useNavigate, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import { Button } from "./ui/button";

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

const LogoutButton = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { mutateAsync, isPending } = useLogoutMutation();

  const handleLogout = async () => {
    await mutateAsync();
    dispatch(clearUser());
    navigate("/login");
  };

  return (
    <Button variant={"secondary"} onClick={handleLogout} className="w-full">
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
};

export default function Sidebar() {
  const { id } = useParams();

  const isChatPage = id !== undefined;
  return (
    <div
      className={cn(
        "w-full md:w-80 bg-white border-r flex flex-col",
        isChatPage && "hidden md:flex"
      )}
    >
      <div className="p-4 border-b h-16">
        <h2 className="text-xl font-bold">Chats</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ChatList />
      </div>

      <div className="p-4">
        <LogoutButton />
      </div>
    </div>
  );
}
