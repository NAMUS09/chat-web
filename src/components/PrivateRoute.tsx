import { useSessionQuery } from "@/hooks/queries/auth";
import MainLayout from "@/layout/main-layout";
import { useAppDispatch, useAppSelector } from "@/store";
import { setUser } from "@/store/slices/authSlice";
import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface Props {
  role?: "user" | "agent" | "admin";
}

export const SessionWrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useSessionQuery();

  useEffect(() => {
    if (data?.user) {
      dispatch(setUser(data.user));
    }
  }, [data, dispatch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export const PublicRoute: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? <Navigate to="/chat" replace /> : <Outlet />;
};

const PrivateRoute: React.FC<Props> = ({ role }) => {
  const user = useAppSelector((state) => state.auth.user);
  const userRole = user?.role;

  if (!userRole) return <Navigate to="/login" replace />;

  if (role && role !== userRole) return <Navigate to="/login" replace />;

  return (
    <MainLayout>
      {" "}
      <Outlet />
    </MainLayout>
  );
};

export default PrivateRoute;
