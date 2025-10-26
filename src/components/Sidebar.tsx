import {
  useAvailableUsersQuery,
  useLogoutMutation,
} from "@/hooks/queries/auth";
import useSocket, { useSocketEvent } from "@/hooks/useSocket";
import { cn, getConversationId } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearUser } from "@/store/slices/authSlice";
import { resetMessageState } from "@/store/slices/messageSlice";
import {
  resetPresence,
  updateBatchPresence,
  updatePresence,
} from "@/store/slices/presenceSlice";
import { useEffect } from "react";
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
          userId={contact._id}
          avatar={contact.profile.avatar}
          displayName={contact.profile.displayName}
        />
        <span>{contact.profile.displayName}</span>
      </div>
    </button>
  );
};

const ChatList = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading } = useAvailableUsersQuery();
  const contactIds = data?.users.map((contact) => contact._id) ?? [];
  const { getPresence } = useSocket(user);

  useEffect(() => {
    if (!contactIds.length) return;

    const timeout = setTimeout(() => {
      getPresence(contactIds, (response) => {
        dispatch(updateBatchPresence(response.presence));
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [contactIds]);

  useSocketEvent<any>(
    "presence:change",
    (data) => {
      if (contactIds.includes(data.userId)) {
        dispatch(updatePresence(data));
      }
    },
    [contactIds]
  );

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
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { mutateAsync, isPending } = useLogoutMutation();
  const { socket } = useSocket(user);

  const handleLogout = async () => {
    await mutateAsync();
    socket.disconnect();
    dispatch(clearUser());
    dispatch(resetPresence());
    dispatch(resetMessageState());
    navigate("/login", { replace: true });
    window.location.href = "/login";
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
