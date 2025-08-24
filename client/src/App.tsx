import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-user";

import Welcome from "@/pages/welcome";
import CustomerHome from "@/pages/customer/home";
import BookingFlow from "@/pages/customer/booking-flow";
import CustomerAppointments from "@/pages/customer/appointments";
import EmergencyBooking from "@/pages/customer/emergency-booking";
import EmergencyTracking from "@/pages/customer/emergency-tracking";
import ProviderDashboard from "@/pages/provider/dashboard";
import ProviderServices from "@/pages/provider/services";
import ProviderSchedule from "@/pages/provider/schedule";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isCustomer, isProvider } = useUser();

  if (!isAuthenticated) {
    return <Welcome />;
  }

  return (
    <Switch>
      {isCustomer && (
        <>
          <Route path="/" component={CustomerHome} />
          <Route path="/customer" component={CustomerHome} />
          <Route path="/customer/booking/:providerId/:serviceId" component={BookingFlow} />
          <Route path="/customer/appointments" component={CustomerAppointments} />
          <Route path="/customer/emergency-booking" component={EmergencyBooking} />
          <Route path="/customer/emergency-tracking/:id" component={EmergencyTracking} />
        </>
      )}
      {isProvider && (
        <>
          <Route path="/" component={ProviderDashboard} />
          <Route path="/services" component={ProviderServices} />
          <Route path="/schedule" component={ProviderSchedule} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
