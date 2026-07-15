import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/use-user";
import { useTheme } from "@/hooks/use-theme";
import { Bell, Zap, Sun, Moon } from "lucide-react";

export function Header() {
  const { user, logout, isProvider } = useUser();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <header className="sticky top-0 z-50"
      style={{ background: "hsl(225 22% 9%)", boxShadow: "0 1px 12px rgba(0,0,0,0.18)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "hsl(204 70% 53% / 0.15)" }}>
                <Zap className="w-4 h-4 text-electric" />
              </div>
              <span className="text-base font-bold tracking-tight" style={{ color: "#FFFFFF" }}>
                Auto<span className="text-electric">Dash</span>
                <span className="font-light" style={{ color: "hsl(204 15% 65%)" }}> Connect</span>
              </span>
            </div>
            {isProvider && (
              <Badge className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5"
                style={{ background: "hsl(204 70% 53% / 0.15)", color: "var(--electric)", border: "1px solid hsl(204 70% 53% / 0.3)" }}>
                Provider
              </Badge>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="relative w-11 h-11 p-0 rounded-xl hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-electric/50 focus-visible:ring-offset-0"
              style={{ color: "hsl(204 15% 65%)" }}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button variant="ghost" size="sm"
              aria-label={isProvider ? "Notifications, 3 unread" : "Notifications"}
              className="relative w-11 h-11 p-0 rounded-xl hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-electric/50 focus-visible:ring-offset-0"
              style={{ color: "hsl(204 15% 65%)" }}>
              <Bell className="w-4 h-4" />
              {isProvider && (
                <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: "var(--electric)" }}>
                  3
                </span>
              )}
            </Button>

            <div className="flex items-center gap-2 pl-2 ml-1"
              style={{ borderLeft: "1px solid hsl(225 15% 25%)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "var(--electric)" }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <Button variant="ghost" size="sm" onClick={logout}
                className="text-xs h-8 px-2 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-electric/50 focus-visible:ring-offset-0"
                style={{ color: "hsl(204 15% 65%)" }}>
                Sign out
              </Button>
            </div>
          </div>

        </div>
      </div>
    </header>
    </>
  );
}
