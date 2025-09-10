import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "../../layouts";

export default function ProtectedLayout() {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const token = useSelector((s) => s.auth.token);
  const authed = isAuthenticated || !!token;

  if (!authed) {
    return <Navigate to="/signin" replace />;
  }

  return (
      <MainLayout>
        <Outlet /> {/* ye zaroori hai nested routes render karne ke liye */}
      </MainLayout>
  );
}
