import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "..";

/**
 * UI Slice - UI state management
 */

interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

interface UIState {
  isSidebarOpen: boolean;
  isModalOpen: boolean;
  modalType: string | null;
  notifications: Notification[];
  theme: "light" | "dark";
}

const initialState: UIState = {
  isSidebarOpen: true,
  isModalOpen: false,
  modalType: null,
  notifications: [],
  theme: "light",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },

    openModal: (state, action: PayloadAction<string>) => {
      state.isModalOpen = true;
      state.modalType = action.payload;
    },

    closeModal: (state) => {
      state.isModalOpen = false;
      state.modalType = null;
    },

    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, "id">>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },

    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  setTheme,
} = uiSlice.actions;

// Selectors
export const selectIsSidebarOpen = (state: RootState) => state.ui.isSidebarOpen;
export const selectIsModalOpen = (state: RootState) => state.ui.isModalOpen;
export const selectModalType = (state: RootState) => state.ui.modalType;
export const selectNotifications = (state: RootState) => state.ui.notifications;
export const selectTheme = (state: RootState) => state.ui.theme;

export default uiSlice.reducer;
