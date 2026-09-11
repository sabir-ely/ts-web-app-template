import { useSession } from "@hono/auth-js/react";
import { Navigate } from "react-router";

type AuthGuardProps = {
  children: React.ReactNode;
};

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/auth/sign-in" />;
  }

  return children;
};
