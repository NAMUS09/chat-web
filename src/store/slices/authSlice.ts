import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "..";

/**
 * Auth Slice - User authentication state
 */

export interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "agent" | "admin";
  profile: {
    displayName: string;
    avatar?: string;
    bio?: string;
  };
  agentInfo?: {
    status: "online" | "offline" | "busy" | "away";
    activeChats: number;
    maxChats: number;
  };
  isOnline: boolean;
  lastSeen: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },

    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    updateUserStatus: (
      state,
      action: PayloadAction<{ isOnline: boolean; lastSeen?: Date }>
    ) => {
      if (state.user) {
        state.user.isOnline = action.payload.isOnline;
        if (action.payload.lastSeen) {
          state.user.lastSeen = action.payload.lastSeen;
        }
      }
    },
  },
});

export const { setUser, clearUser, setLoading, setError, updateUserStatus } =
  authSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
