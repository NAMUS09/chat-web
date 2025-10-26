import { useSessionQuery } from "@/hooks/queries/auth";
import MainLayout from "@/layout/main-layout";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLoading, setUser, type User } from "@/store/slices/authSlice";
import React, { useEffect, useEffectEvent } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface Props {
  role?: "user" | "agent" | "admin";
}

export const SessionWrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useSessionQuery();

  const setSessionLoading = useEffectEvent((isLoading: boolean) => {
    dispatch(setLoading(isLoading));
  });

  const setUserSession = useEffectEvent((user: User) => {
    dispatch(setUser(user));
  });

  useEffect(() => {
    setSessionLoading(true);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    setSessionLoading(false);
    if (data?.user) {
      setUserSession(data.user);
    }
  }, [isLoading, data]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export const PublicRoute: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return isAuthenticated ? <Navigate to="/chat" replace /> : <Outlet />;
};

const PrivateRoute: React.FC<Props> = () => {
  const { user, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const userRole = user?.role;

  if (!userRole) return <Navigate to="/login" replace />;

  return (
    <MainLayout>
      {" "}
      <Outlet />
    </MainLayout>
  );
};

export default PrivateRoute;
