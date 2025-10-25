import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

type Response = {
  messages: any[];
};

export const useConversationsQuery = (id: string) =>
  useQuery({
    queryKey: ["conversations", id],
    queryFn: async () => {
      const response = await axiosInstance.get<Response>(`/messages/${id}`);
      return response.data;
    },
  });
