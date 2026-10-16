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
  `flex items-center gap-3 rounded-xl border-l-2 px-4 py-3 text-sm font-semibold transition ${
    isActive
      ? "border-[#B8F34A] bg-[#2563EB]/20 text-[#F4F7FF] shadow-[inset_0_0_24px_rgba(37,99,235,0.08)]"
      : "border-transparent text-[#A8B5CC] hover:bg-white/5 hover:text-[#F4F7FF]"
  }`;

const tabLink = ({ isActive }) =>
  `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] transition ${
    isActive ? "text-[#22D3EE]" : "text-[#A8B5CC]"
  }`;

export default function AppShell({ eyebrow, title, subtitle, actions, children, width = "max-w-5xl" }) {
  const { user, logout } = useAuth();

  return (
    <div className="electric-app min-h-screen bg-[#080D1B] text-[#F4F7FF]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#101A2E]/65 shadow-[12px_0_60px_rgba(0,0,0,0.18)] backdrop-blur-2xl lg:flex">
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
              <p className="truncate text-xs text-[#A8B5CC]">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              aria-label="Sign out"
              title="Sign out"
              className="border border-white/10 p-2 text-[#A8B5CC] transition hover:border-rose-400/40 hover:text-rose-300"
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
          className="border border-white/10 p-2 text-[#A8B5CC] transition hover:text-rose-300"
        >
          <LogOut size={16} />
        </button>
      </header>

      <main className="px-5 pb-28 pt-8 sm:px-8 lg:ml-64 lg:pb-16 lg:pt-12">
        <div className={`mx-auto w-full ${width}`}>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-white/10 bg-[#101A2E]/35 p-5 backdrop-blur-xl sm:p-7">
            <div className="min-w-0">
              {eyebrow && (
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[#B8F34A]">{eyebrow}</p>
              )}
              <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">{title}</h1>
              {subtitle && <p className="mt-2 max-w-xl text-sm text-[#A8B5CC] sm:text-base">{subtitle}</p>}
            </div>
            {actions}
          </div>
          {children}
        </div>
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-[#101A2E]/85 shadow-[0_-12px_40px_rgba(0,0,0,0.2)] backdrop-blur-2xl lg:hidden"
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
