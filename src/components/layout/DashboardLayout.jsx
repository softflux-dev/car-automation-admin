import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden w-[260px] shrink-0 lg:block bg-white">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="h-[72px] shrink-0 bg-muted px-6 border-b border-border">
          <Header />
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
