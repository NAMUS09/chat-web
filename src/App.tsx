import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute, {
  PublicRoute,
  SessionWrapper,
} from "./components/PrivateRoute";
import ChatDetailPage from "./pages/ChatDetailPage";
import ChatListPage from "./pages/ChatListPage";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route path="/chat" element={<ChatListPage />} />
        <Route path="/chat/:id" element={<ChatDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <SessionWrapper>
      <AppRoutes />
    </SessionWrapper>
  );
}

export default App;
