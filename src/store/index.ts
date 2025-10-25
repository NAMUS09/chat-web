import { configureStore } from "@reduxjs/toolkit";
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import authReducer from "./slices/authSlice";
import messageReducer from "./slices/messageSlice";
import presenceReducer from "./slices/presenceSlice";
import uiReducer from "./slices/uiSlice";

/**
 * Redux Store Configuration
 *
 * ARCHITECTURE:
 * - Redux Toolkit for modern Redux patterns
 * - Immer for immutable updates
 * - Redux DevTools for debugging
 * - Typed hooks for TypeScript
 *
 * SLICES:
 * - auth: User authentication state
 * - message: Chat messages and conversations
 * - presence: User online/offline status
 * - ui: UI state (modals, notifications, etc.)
 */

export const store = configureStore({
  reducer: {
    auth: authReducer,
    message: messageReducer,
    presence: presenceReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for non-serializable values
        ignoredActions: ["message/addMessage"],
        // Ignore these paths in the state
        ignoredPaths: ["message.messages"],
      },
    }),
  devTools: import.meta.env.VITE_MODE !== "production",
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for TypeScript
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
