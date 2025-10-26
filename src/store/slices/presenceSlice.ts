import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "..";

/**
 * Presence Slice - User online/offline status
 */

export interface UserPresence {
  userId: string;
  username: string;
  status: "online" | "offline" | "away";
  lastSeen: string;
}

interface PresenceState {
  // Map of userId to presence data
  presenceMap: Record<string, UserPresence>;

  // List of online users
  onlineUsers: string[];
}

const initialState: PresenceState = {
  presenceMap: {},
  onlineUsers: [],
};

const presenceSlice = createSlice({
  name: "presence",
  initialState,
  reducers: {
    // Update single user presence
    updatePresence: (state, action: PayloadAction<UserPresence>) => {
      const presence = action.payload;
      state.presenceMap[presence.userId] = presence;

      // Update online users list
      if (presence.status === "online") {
        if (!state.onlineUsers.includes(presence.userId)) {
          state.onlineUsers.push(presence.userId);
        }
      } else {
        state.onlineUsers = state.onlineUsers.filter(
          (id) => id !== presence.userId
        );
      }
    },

    // Batch update multiple user presences
    updateBatchPresence: (state, action: PayloadAction<UserPresence[]>) => {
      action.payload.forEach((presence) => {
        state.presenceMap[presence.userId] = presence;

        if (presence.status === "online") {
          if (!state.onlineUsers.includes(presence.userId)) {
            state.onlineUsers.push(presence.userId);
          }
        } else {
          state.onlineUsers = state.onlineUsers.filter(
            (id) => id !== presence.userId
          );
        }
      });
    },

    // Remove user presence
    removePresence: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      delete state.presenceMap[userId];
      state.onlineUsers = state.onlineUsers.filter((id) => id !== userId);
    },

    // Reset presence state
    resetPresence: () => initialState,
  },
});

export const {
  updatePresence,
  updateBatchPresence,
  removePresence,
  resetPresence,
} = presenceSlice.actions;

// Selectors
export const selectUserPresence = (state: RootState, userId: string) =>
  state.presence.presenceMap[userId] || {
    userId,
    username: "",
    status: "offline",
    lastSeen: "",
  };

export const selectOnlineUsers = (state: RootState) =>
  state.presence.onlineUsers;

export const selectIsUserOnline = (state: RootState, userId: string) =>
  state.presence.onlineUsers.includes(userId);

export default presenceSlice.reducer;
