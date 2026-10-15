import { NavLink } from "react-router-dom";
import { House, MessageCircle, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/Authcontext";
import { UserAvatar } from "../AvatarUpload";
import { Wordmark } from "./shared";

const items = [
  { to: "/home", label: "Home", icon: House },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

const sideLink = ({ isActive }) =>
  `flex items-center gap-3 border-l-2 px-4 py-3 text-sm font-semibold transition ${
    isActive
      ? "border-[#67E8F9] bg-[#2F6BFF]/15 text-[#F1F5F9]"
      : "border-transparent text-[#94A3B8] hover:bg-white/5 hover:text-[#F1F5F9]"
  }`;

const tabLink = ({ isActive }) =>
  `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] transition ${
    isActive ? "text-[#67E8F9]" : "text-[#94A3B8]"
  }`;

export default function AppShell({ eyebrow, title, subtitle, actions, children, width = "max-w-5xl" }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F1F5F9]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#101A2E]/70 backdrop-blur-2xl lg:flex">
        <div className="px-6 py-7">
          <Wordmark />
        </div>
        <nav aria-label="Main" className="flex-1 space-y-1 px-3">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={sideLink}>
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} className="h-10 w-10 text-sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{user?.name}</p>
              <p className="truncate text-xs text-[#94A3B8]">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              aria-label="Sign out"
              title="Sign out"
              className="border border-white/10 p-2 text-[#94A3B8] transition hover:border-rose-400/40 hover:text-rose-300"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#101A2E]/80 px-5 py-3 backdrop-blur-2xl lg:hidden">
        <Wordmark className="text-lg" />
        <button
          onClick={logout}
          aria-label="Sign out"
          className="border border-white/10 p-2 text-[#94A3B8] transition hover:text-rose-300"
        >
          <LogOut size={16} />
        </button>
      </header>

      <main className="px-5 pb-28 pt-8 sm:px-8 lg:ml-64 lg:pb-16 lg:pt-12">
        <div className={`mx-auto w-full ${width}`}>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              {eyebrow && (
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[#8B5CF6]">{eyebrow}</p>
              )}
              <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">{title}</h1>
              {subtitle && <p className="mt-2 max-w-xl text-sm text-[#94A3B8] sm:text-base">{subtitle}</p>}
            </div>
            {actions}
          </div>
          {children}
        </div>
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-[#101A2E]/90 backdrop-blur-2xl lg:hidden"
      >
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={tabLink}>
            <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
