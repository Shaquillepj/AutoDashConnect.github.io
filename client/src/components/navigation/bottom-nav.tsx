import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { Home, Search, Calendar, Gift, User, BarChart, Settings, Clock } from "lucide-react";

export function BottomNav() {
  const { isCustomer, isProvider } = useUser();
  const [location, setLocation] = useLocation();

  const customerNavItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Calendar, label: "Bookings", path: "/appointments" },
    { icon: Gift, label: "Rewards", path: "/rewards" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const providerNavItems = [
    { icon: BarChart, label: "Dashboard", path: "/" },
    { icon: Settings, label: "Services", path: "/services" },
    { icon: Clock, label: "Schedule", path: "/schedule" },
    { icon: Calendar, label: "Bookings", path: "/bookings" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const navItems = isCustomer ? customerNavItems : providerNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-5 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center py-2 h-auto ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
