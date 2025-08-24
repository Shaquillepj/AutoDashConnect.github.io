import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import { ServiceProvider } from "@shared/schema";
import { useLocation } from "wouter";

interface ProviderCardProps {
  provider: ServiceProvider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const [, setLocation] = useLocation();

  const handleViewProvider = () => {
    // In a real app, you'd navigate to the provider's detail page
    // For now, we'll just navigate to a booking flow with a default service
    setLocation(`/booking/${provider.id}/service-1`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewProvider}>
      <div className="relative">
        <img 
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
          alt="Professional auto detailing service" 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-white/90 text-gray-800">Mobile Service</Badge>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{provider.businessName}</h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-900">{provider.rating}</span>
            <span className="text-sm text-gray-500">({provider.reviewCount})</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-3">{provider.description}</p>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <MapPin className="w-4 h-4 inline mr-1" />
            <span>{provider.serviceRadius} miles radius</span>
          </div>
          <div className="text-sm font-medium text-green-600">
            Available Now
          </div>
        </div>
        <Button className="w-full mt-4" onClick={handleViewProvider}>
          View Services
        </Button>
      </CardContent>
    </Card>
  );
}
