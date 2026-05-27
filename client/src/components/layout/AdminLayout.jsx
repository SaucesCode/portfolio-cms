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
  { path: "/admin/projects", label: "Projects", href: "/admin/projects", icon: FolderOpen },
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
    flex items-center gap-3 px-3 h-9 rounded-lg text-[11px] font-medium uppercase tracking-[0.08em] transition-all duration-150 relative group
    ${
      isActive
        ? "bg-foreground/[0.03] text-foreground font-bold border border-border/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
    }
  `;

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-card border-r border-border w-56 p-4 select-none subpixel-antialiased">
      {/* Logo */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono font-black text-xs tracking-wider shadow-sm">
            VCS
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground block truncate">
              Core Console
            </span>
            <span className="text-[9px] font-mono text-muted-foreground/80 block truncate">
              v2026.4.1
            </span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto scrollbar-none pr-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            end={href === "/admin"} // 'end' prevents /admin matching all sub-routes
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-[-16px] top-2 bottom-2 w-[3px] rounded-r-full bg-primary" />
                )}
                <Icon
                  size={14}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground/60 group-hover:text-foreground transition-colors"
                  }
                />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="border-t border-border pt-4 mt-4 shrink-0 bg-card">
        <div className="flex items-center gap-3 px-1.5 mb-3 overflow-hidden">
          <div className="h-7 w-7 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
            <User size={12} className="text-muted-foreground" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold tracking-wide truncate text-foreground block">
              {user?.email?.split("@")[0] || "Operator"}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground truncate uppercase block">
              {user?.email || "root@vcs.node"}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 h-9 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive hover:bg-destructive/5 border border-transparent hover:border-destructive/10 transition-all duration-150 w-full cursor-pointer"
        >
          <LogOut size={13} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex selection:bg-primary/10 selection:text-primary">
      {/* Desktop sidebar — locked viewport containment layout */}
      <div className="hidden md:flex flex-shrink-0 sticky top-0 h-screen z-40">
        <Sidebar />
      </div>

      {/* Mobile sidebar — slides in */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 flex-shrink-0 h-full animate-in slide-in-from-left duration-200">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <Menu size={18} />
            </button>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
              Core Console
            </span>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono font-black text-xs tracking-wider">
            V
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-10 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
