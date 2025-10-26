import Sidebar from "@/components/Sidebar";
import useSocket, { useSocketEvent } from "@/hooks/useSocket";
import { useAppDispatch, useAppSelector } from "@/store";
import { addMessage } from "@/store/slices/messageSlice";
import { useQueryClient } from "@tanstack/react-query";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { isConnected, markAsDelivered } = useSocket(currentUser);

  const dispatch = useAppDispatch();
  // Listen for new messages
  useSocketEvent<any>(
    "message:new",
    (data) => {
      if (data.conversationId) {
        markAsDelivered(data.message._id, data.conversationId);
      }
      queryClient.invalidateQueries({
        queryKey: ["conversations", data.conversationId],
      });
      dispatch(addMessage(data.message));
    },
    [isConnected]
  );
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default MainLayout;
