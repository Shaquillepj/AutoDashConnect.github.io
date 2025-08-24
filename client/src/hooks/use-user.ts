import { useState, useEffect } from "react";
import { User } from "@shared/schema";
import { auth } from "@/lib/auth";

export function useUser() {
  const [user, setUser] = useState<User | null>(auth.getCurrentUser());

  useEffect(() => {
    // Listen for auth changes
    const checkAuth = () => {
      setUser(auth.getCurrentUser());
    };
    
    // Poll for changes every second (in a real app you'd use proper state management)
    const interval = setInterval(checkAuth, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const login = (userData: User) => {
    auth.setCurrentUser(userData);
    setUser(userData);
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: auth.isAuthenticated(),
    isCustomer: auth.isCustomer(),
    isProvider: auth.isProvider()
  };
}
