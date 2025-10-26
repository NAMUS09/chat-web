import axiosInstance from "@/lib/axios";
import type { LoginSchema, RegisterSchema } from "@/schemas/auth.schema";
import type { User } from "@/store/slices/authSlice";
import { useMutation, useQuery } from "@tanstack/react-query";

type LoginResponse = {
  user: User;
};

type AgentResponse = {
  agents: User[];
};

type MongoDbUser = Omit<User, "id"> & { _id: string };
type AvailableUsersResponse = {
  users: MongoDbUser[];
};

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: async (data: RegisterSchema) => {
      const response = await axiosInstance.post<LoginResponse>(
        "/auth/register",
        data
      );
      return response.data;
    },
    meta: {
      successMessage: "Registered successfully",
      errorMessage: "Failed to register",
    },
  });

export const useLoginMutation = () =>
  useMutation({
    mutationFn: async (data: LoginSchema) => {
      const response = await axiosInstance.post<LoginResponse>(
        "/auth/login",
        data
      );
      return response.data;
    },
    meta: {
      successMessage: "Logged in successfully",
      errorMessage: "Failed to log in",
    },
  });

export const useLogoutMutation = () =>
  useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/auth/logout");
      return response.data;
    },
    meta: {
      successMessage: "Logged out successfully",
      errorMessage: "Failed to log out",
    },
  });

export const useSessionQuery = () =>
  useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const response = await axiosInstance.get<LoginResponse>("/auth/session");
      return response.data;
    },
  });

export const useAvailableUsersQuery = () =>
  useQuery({
    queryKey: ["available-users"],
    queryFn: async () => {
      const response = await axiosInstance.get<AvailableUsersResponse>(
        "/users/available-users"
      );
      return response.data;
    },
  });

export const useAgentsQuery = () =>
  useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const response = await axiosInstance.get<AgentResponse>("/users/agents");
      return response.data;
    },
  });
