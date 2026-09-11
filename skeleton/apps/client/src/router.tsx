import { lazy } from "react";
import { createBrowserRouter, type RouteObject } from "react-router";
{{#if useAuth}}
import { AuthGuard } from "./components/AuthGuard";
{{/if}}
import { Root } from "./layouts/Root";

const Home = lazy(() => import("./pages/Home"));
{{#if useAuth}}
const SignIn = lazy(() => import("./pages/auth/SignIn"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
{{/if}}

const routes: RouteObject[] = [
{{#if useAuth}}
  {
    path: "/auth/sign-in",
    element: <SignIn />,
  },
  {
    path: "/auth/sign-up",
    element: <SignUp />,
  },
{{/if}}
  {
    path: "/",
{{#if useAuth}}
    element: (
      <AuthGuard>
        <Root />
      </AuthGuard>
    ),
{{else}}
    element: <Root />,
{{/if}}
    children: [
      {
        path: "",
        element: <Home />,
      },
    ],
  },
  {
    path: "*",
    element: <div>Not found.</div>,
  },
];

export const router = createBrowserRouter(routes);
