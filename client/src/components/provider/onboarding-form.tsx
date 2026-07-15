import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/navigation/header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Wrench, MapPin } from "lucide-react";

interface OnboardingFormProps {
  userId: string;
}

export function OnboardingForm({ userId }: OnboardingFormProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    businessName: "",
    description: "",
    serviceRadius: "25",
    address: "",
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Location not supported", description: "Please enter your address manually", variant: "destructive" });
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setForm(prev => ({ ...prev, address: prev.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        setIsGettingLocation(false);
      },
      () => {
        toast({ title: "Location access denied", description: "Please enter your address manually", variant: "destructive" });
        setIsGettingLocation(false);
      }
    );
  };

  const createProviderMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/providers', {
        userId,
        businessName: form.businessName,
        description: form.description || undefined,
        serviceRadius: parseInt(form.serviceRadius) || 25,
        isActive: true,
        isAvailable: true,
        ...(coords && form.address ? {
          latitude: coords.lat.toString(),
          longitude: coords.lng.toString(),
          location: { lat: coords.lat, lng: coords.lng, address: form.address },
        } : {}),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers/user', userId] });
      toast({ title: "Business profile created", description: "You're all set — let's add your first service." });
    },
    onError: () => {
      toast({
        title: "Couldn't create your business profile",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) return;
    createProviderMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "hsl(204 70% 53% / 0.1)", border: "1px solid hsl(204 70% 53% / 0.2)" }}>
            <Wrench className="w-7 h-7 text-electric" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Set up your business</h1>
          <p className="text-sm text-muted-foreground">
            Tell customers who you are before you start accepting bookings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-surface rounded-2xl p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={form.businessName}
              onChange={(e) => setForm(prev => ({ ...prev, businessName: e.target.value }))}
              placeholder="e.g., Elite Auto Detailing"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What services do you offer? What makes your business stand out?"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="serviceRadius">Service Radius (miles)</Label>
            <Input
              id="serviceRadius"
              type="number"
              min={1}
              value={form.serviceRadius}
              onChange={(e) => setForm(prev => ({ ...prev, serviceRadius: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Business Location</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your address"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
              >
                <MapPin className="w-4 h-4 mr-1.5" />
                {isGettingLocation ? "Locating…" : "Use Current"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Customers search by location — without this, you won't show up in nearby results yet.
            </p>
          </div>

          <Button
            type="submit"
            disabled={!form.businessName.trim() || createProviderMutation.isPending}
            className="w-full bg-electric text-white hover:bg-electric-dim font-semibold"
          >
            {createProviderMutation.isPending ? "Creating…" : "Create Business Profile"}
          </Button>
        </form>
      </main>
    </div>
  );
}
