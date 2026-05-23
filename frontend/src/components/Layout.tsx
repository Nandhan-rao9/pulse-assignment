import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import {
  LayoutDashboard,
  Upload,
  Library,
  Shield,
  LogOut,
  Menu,
  X,
  Wifi,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { usePermissions } from "../rbac";
import type { UserRole } from "../types";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const { can, roleInfo } = usePermissions();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };

  const navItems: NavItem[] = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "editor", "viewer"],
    },
    {
      to: "/upload",
      label: "Upload",
      icon: Upload,
      roles: ["admin", "editor"],
    },
    {
      to: "/library",
      label: "Library",
      icon: Library,
      roles: ["admin", "editor", "viewer"],
    },
    { to: "/admin", label: "Admin", icon: Shield, roles: ["admin"] },
  ];

  const filteredNav = navItems.filter((item) =>
    item.roles.includes(user?.role as UserRole),
  );

  // Permission-aware helpers used in the sidebar
  const canUpload = can("video:upload");
  const isAdmin = can("admin:access");

  const linkClasses = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 glow"
        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
    }`;

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-zinc-900/95 border-r border-zinc-800 flex flex-col transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/50">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4l8 6-8 6V4z" fill="white" />
            </svg>
          </div>
          <span className="text-xl font-bold gradient-text">Pulse</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClasses}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} strokeWidth={2.5} />
              <span className="font-semibold">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info & logout */}
        <div className="border-t border-zinc-800 px-4 py-4">
          <div className="flex items-center gap-2 mb-3 px-2">
            {connected ? (
              <Wifi size={14} className="text-emerald-400" />
            ) : (
              <WifiOff size={14} className="text-red-400" />
            )}
            <span className="text-xs text-zinc-500">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-100 truncate">
                {user?.name}
              </p>
              {roleInfo && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    user?.role === "admin"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : user?.role === "editor"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-zinc-700/50 text-zinc-400 border border-zinc-600"
                  }`}
                >
                  {roleInfo.label}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-zinc-900/95 border-b border-zinc-800 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-xl transition-colors"
          >
            <Menu size={22} />
          </button>
          <span className="font-bold gradient-text">Pulse</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-black via-zinc-900 to-black">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
