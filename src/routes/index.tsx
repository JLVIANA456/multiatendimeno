import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import ChatProvider from "pages/chat/context/chat";
const ChatPage = React.lazy(() => import("pages/chat/chat-room-page"));
const UnSelectedChatPage = React.lazy(() => import("pages/chat/unselected-page"));
const MainSidebar = React.lazy(() => import("common/components/sidebar/MainSidebar"));
const WorkspacesPage = React.lazy(() => import("pages/workspaces"));
const ProfilePage = React.lazy(() => import("pages/profile"));
const ChannelsPage = React.lazy(() => import("pages/channels"));
const DashboardPage = React.lazy(() => import("../pages/dashboard"));
const ClientsPage = React.lazy(() => import("../pages/clients"));
const ContactsPage = React.lazy(() => import("../pages/contacts"));
const SettingsPage = React.lazy(() => import("../pages/settings"));



interface AppRoutesProps {
  onLogout: () => void;
}

export default function AppRoutes({ onLogout }: AppRoutesProps) {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <React.Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-gray-50"><i className="fa-solid fa-circle-notch animate-spin text-primary-500 text-3xl"></i></div>}>
          <div className="flex bg-gray-50 overflow-hidden h-screen w-full">
            <MainSidebar onLogout={onLogout} />
            <div className="flex-1 relative overflow-hidden flex flex-col">
              <Outlet />
            </div>
          </div>
        </React.Suspense>
      ),
      children: [
        {
          path: "",
          element: <WorkspacesPage />,
        },
        {
          path: "dashboard",
          element: <DashboardPage />,
        },
        {
          path: "clients",
          element: <ClientsPage />,
        },
        {
          path: "contacts",
          element: <ContactsPage />,
        },


        {
          path: "profile",
          element: <ProfilePage />,
        },

        {
          path: "settings",
          element: <SettingsPage />,
        },
        {
          path: "channels",
          element: <ChannelsPage />,
        },
        {
          path: "chat",
          children: [
            {
              path: ":id",
              element: <ChatPage />,
            },
            {
              path: "",
              element: <UnSelectedChatPage />,
            },
          ],
        },
      ],
    },
  ]);

  return (
    <ChatProvider>
      <RouterProvider router={router} />
    </ChatProvider>
  );
}
