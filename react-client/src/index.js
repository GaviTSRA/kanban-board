import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import BoardView from "./BoardView";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <BoardView />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode className="h-full">
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} className="h-full" />
    </QueryClientProvider>
  </React.StrictMode>
);
