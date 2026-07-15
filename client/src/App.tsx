import { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-user";

const Welcome = lazy(() => import("@/pages/welcome"));
const CustomerHome = lazy(() => import("@/pages/customer/home"));
const BookingFlow = lazy(() => import("@/pages/customer/booking-flow"));
const CustomerAppointments = lazy(() => import("@/pages/customer/appointments"));
const EmergencyBooking = lazy(() => import("@/pages/customer/emergency-booking"));
const EmergencyTracking = lazy(() => import("@/pages/customer/emergency-tracking"));
const ProviderDashboard = lazy(() => import("@/pages/provider/dashboard"));
const ProviderServices = lazy(() => import("@/pages/provider/services"));
const ProviderSchedule = lazy(() => import("@/pages/provider/schedule"));
const NotFound = lazy(() => import("@/pages/not-found"));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-electric border-t-transparent animate-spin" aria-label="Loading" />
    </div>
  );
}

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
        <Suspense fallback={<RouteFallback />}>
          <Router />
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
