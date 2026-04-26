import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useDemoMode } from "@/hooks/useDemoMode";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/diff", label: "Diff" },
  { to: "/arch", label: "Architecture" },
  { to: "/gallery", label: "Gallery" },
];

const SiteLayout = () => {
  const demoMode = useDemoMode();
  return (
    <div className="min-h-screen bg-background text-foreground">
      {!demoMode && (
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <NavLink to="/" className="font-mono text-base font-semibold tracking-tight text-foreground">
            Buena-Context-Engine
          </NavLink>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-1.5 text-base font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        </header>
      )}
      <main className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <Outlet />
      </main>
    </div>
  );
};

export default SiteLayout;