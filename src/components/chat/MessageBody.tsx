import { useAppSelector } from "@/store";
import { selectMessages } from "@/store/slices/messageSlice";
import { useEffect, useRef, useState } from "react";

type Props = {
  conversationId: string;
};

const MessageBody: React.FC<Props> = ({ conversationId }) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const messages = useAppSelector((state) =>
    selectMessages(state, conversationId)
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessageStatus = (status: string) => {
    switch (status) {
      case "sent":
        return <span className="text-gray-400">✓</span>;
      case "delivered":
        return <span className="text-gray-400">✓✓</span>;
      case "read":
        return <span className="text-green-300 leading-0">✓✓</span>;
      default:
        return null;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 150; // px from bottom
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      setIsUserNearBottom(distanceFromBottom < threshold);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [conversationId]);

  useEffect(() => {
    if (isUserNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No messages yet. Start the conversation!
        </div>
      ) : (
        messages.map((message) => {
          const isOwnMessage = message.senderId._id === currentUser?.id;
          return (
            <div
              key={message._id}
              className={`flex ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isOwnMessage
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="wrap-break-word">{message.content}</p>
                <div
                  className={`flex items-center gap-1 justify-end mt-1 text-xs ${
                    isOwnMessage ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  <span>{formatTime(message.timestamp)}</span>
                  {isOwnMessage && renderMessageStatus(message.status)}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageBody;
