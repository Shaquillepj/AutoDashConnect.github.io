import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { Home, Search, Calendar, Gift, User, BarChart, Settings, Clock } from "lucide-react";

export function BottomNav() {
  const { isCustomer, isProvider } = useUser();
  const [location, setLocation] = useLocation();

  const customerNavItems = [
    { icon: Home,     label: "Home",     path: "/" },
    { icon: Search,   label: "Search",   path: "/search" },
    { icon: Calendar, label: "Bookings", path: "/appointments" },
    { icon: Gift,     label: "Rewards",  path: "/rewards" },
    { icon: User,     label: "Profile",  path: "/profile" },
  ];

  const providerNavItems = [
    { icon: BarChart,  label: "Dashboard", path: "/" },
    { icon: Settings,  label: "Services",  path: "/services" },
    { icon: Clock,     label: "Schedule",  path: "/schedule" },
    { icon: Calendar,  label: "Bookings",  path: "/bookings" },
    { icon: User,      label: "Profile",   path: "/profile" },
  ];

  const navItems = isCustomer ? customerNavItems : providerNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border md:hidden"
      style={{ boxShadow: "0 -1px 8px hsl(220 14% 50% / 0.08)" }}>
      <div className="grid grid-cols-5 py-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-colors"
            >
              <div className={[
                "w-8 h-8 flex items-center justify-center rounded-xl transition-all",
                isActive ? "bg-electric/10" : "",
              ].join(" ")}>
                <Icon className={`w-5 h-5 ${isActive ? "text-electric" : "text-muted-foreground"}`} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-electric" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
