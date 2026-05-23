import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  Wrench,
  Briefcase,
  Award,
  MessageSquare,
  BarChart2,
  FileText,
  Inbox,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Hero", href: "/admin/hero", icon: User },
  { label: "Projects", href: "/admin/projects", icon: FolderOpen },
  { label: "Skills", href: "/admin/skills", icon: Wrench },
  { label: "Experience", href: "/admin/experience", icon: Briefcase },
  { label: "Certifications", href: "/admin/certifications", icon: Award },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
  { label: "Stats", href: "/admin/stats", icon: BarChart2 },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Inbox", href: "/admin/inbox", icon: Inbox },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/admin/login");
  };

  const navLinkClass = ({ isActive }) => `
    flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
    ${
      isActive
        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    }
  `;

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-gray-900 border-r border-white/5 w-56 p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-2 mb-6">
        <div className="w-6 h-6 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <span className="text-blue-400 text-xs font-bold">P</span>
        </div>
        <span className="text-white font-semibold text-sm">Portfolio Admin</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            end={href === "/admin"} // 'end' prevents /admin matching all sub-routes
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/5 pt-4 mt-4">
        <p className="text-xs text-gray-600 px-3 mb-2 truncate">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200 w-full"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Desktop sidebar — always visible */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar — slides in */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-gray-900">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-gray-400 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <span className="text-white font-semibold text-sm">Portfolio Admin</span>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
