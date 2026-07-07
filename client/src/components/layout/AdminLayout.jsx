import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  FolderKanban,
  Wrench,
  Briefcase,
  Award,
  MessageSquare,
  MessagesSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutGrid, end: true }],
  },
  {
    label: "Content",
    items: [
      { label: "Projects", href: "/admin/projects", icon: FolderKanban },
      { label: "Blog", href: "/admin/blog", icon: Briefcase },
      { label: "Skills", href: "/admin/skills", icon: Wrench },
      { label: "Experience", href: "/admin/experience", icon: Briefcase },
      { label: "Certifications", href: "/admin/certifications", icon: Award },
      { label: "Testimonials", href: "/admin/testimonials", icon: MessagesSquare },
    ],
  },
  {
    label: "Inbox",
    items: [{ label: "Messages", href: "/admin/inbox", icon: MessageSquare }],
  },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/admin/login");
  };

  const navLinkClass = ({ isActive }) => `
    relative flex items-center gap-2.5 pl-3.5 pr-2.5 h-8 rounded-md text-[13px] font-medium transition-colors
    ${isActive ? "" : "hover:bg-[var(--muted)]"}
  `;

  const Sidebar = () => (
    <aside
      className="flex flex-col h-full w-60 shrink-0"
      style={{ background: "var(--card)", borderRight: "1px solid var(--rule)" }}
    >
      {/* Wordmark */}
      <div className="flex items-center justify-between px-4 h-14 shrink-0" style={{ borderBottom: "1px solid var(--rule)" }}>
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold"
            style={{ background: "var(--signal)", color: "var(--background)" }}
          >
            W
          </div>
          <span className="text-[13px] font-semibold tracking-tight">Workbench</span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden" style={{ color: "var(--muted-foreground)" }}>
          <X size={15} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p
              className="px-3.5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--muted-foreground)", opacity: 0.7 }}
            >
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map(({ label, href, icon: Icon, end }) => (
                <NavLink key={href} to={href} end={end} className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                  {({ isActive }) => (
                    <>
                      <span
                        className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-full transition-opacity"
                        style={{ background: "var(--signal)", opacity: isActive ? 1 : 0 }}
                      />
                      <Icon size={15} style={{ color: isActive ? "var(--signal)" : "var(--muted-foreground)" }} />
                      <span style={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}>{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom — live site link + account */}
      <div className="px-3 pb-3 pt-2 shrink-0" style={{ borderTop: "1px solid var(--rule)" }}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 h-8 rounded-md text-[12.5px] font-medium transition-colors hover:bg-[var(--muted)]"
          style={{ color: "var(--muted-foreground)" }}
        >
          View live site
          <ArrowUpRight size={13} />
        </a>

        <div className="flex items-center justify-between px-3.5 mt-1 h-11">
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium truncate">{user?.email?.split("@")[0] || "Admin"}</p>
            <p className="text-[11px] truncate" style={{ color: "var(--muted-foreground)" }}>
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Sign out"
            className="p-1.5 rounded-md transition-colors hover:bg-[var(--muted)]"
            style={{ color: "var(--muted-foreground)" }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div
      className="admin-shell min-h-screen flex"
      style={{ background: "var(--background)", color: "var(--foreground)", "--radius": "10px" }}
    >
      <div className="hidden md:flex shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="md:hidden flex items-center justify-between px-4 h-14 sticky top-0 z-30"
          style={{ background: "var(--card)", borderBottom: "1px solid var(--rule)" }}
        >
          <button onClick={() => setSidebarOpen(true)} style={{ color: "var(--muted-foreground)" }}>
            <Menu size={18} />
          </button>
          <span className="text-[13px] font-semibold">Workbench</span>
          <div className="w-[18px]" />
        </div>

        <main className="flex-1 px-6 py-8 md:px-10 md:py-10 max-w-[1100px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}