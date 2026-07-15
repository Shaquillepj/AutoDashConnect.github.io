import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, DollarSign, Car, Wrench, Settings, ClipboardList } from "lucide-react";
import { Service, AddOnService } from "@shared/schema";
import { formatDuration } from "@/lib/utils";

interface ServiceSelectionProps {
  services: Service[];
  addOns: AddOnService[];
  selectedServiceId: string;
  selectedAddOnIds: string[];
  onComplete: (data: { serviceId: string; addOnIds: string[]; totalAmount: number }) => void;
}

export function ServiceSelection({ 
  services, 
  addOns, 
  selectedServiceId, 
  selectedAddOnIds, 
  onComplete 
}: ServiceSelectionProps) {
  const [currentServiceId, setCurrentServiceId] = useState(selectedServiceId);
  const [currentAddOnIds, setCurrentAddOnIds] = useState<string[]>(selectedAddOnIds);

  const selectedService = services.find(s => s.id === currentServiceId);

  const calculateTotal = () => {
    let total = 0;
    if (selectedService) {
      total += parseFloat(selectedService.basePrice);
    }
    currentAddOnIds.forEach(addOnId => {
      const addOn = addOns.find(a => a.id === addOnId);
      if (addOn) {
        total += parseFloat(addOn.price);
      }
    });
    return total;
  };

  const handleAddOnToggle = (addOnId: string) => {
    setCurrentAddOnIds(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const handleContinue = () => {
    if (currentServiceId) {
      onComplete({
        serviceId: currentServiceId,
        addOnIds: currentAddOnIds,
        totalAmount: calculateTotal()
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'detailing': return Car;
      case 'mechanical': return Wrench;
      case 'maintenance': return Settings;
      default: return ClipboardList;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'detailing': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300';
      case 'mechanical': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'maintenance': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
      default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Selection */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Select Service</h2>
          <div className="space-y-4">
            {services.map((service) => (
              <label
                key={service.id}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                  currentServiceId === service.id
                    ? 'border-electric bg-electric/5'
                    : 'border-border hover:border-electric/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="service"
                    checked={currentServiceId === service.id}
                    onChange={() => setCurrentServiceId(service.id)}
                    className="text-electric focus:ring-electric"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-foreground">{service.name}</h3>
                      <Badge className={`gap-1 ${getCategoryColor(service.category)}`}>
                        {(() => { const CategoryIcon = getCategoryIcon(service.category); return <CategoryIcon className="w-3 h-3" />; })()}
                        {service.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDuration(service.duration)}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Mobile service
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-foreground">${service.basePrice}</div>
                  <div className="text-sm text-muted-foreground">Starting price</div>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add-On Services */}
      {addOns.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Add-On Services</h3>
            <div className="space-y-3">
              {addOns.map((addOn) => (
                <label
                  key={addOn.id}
                  className="flex items-center justify-between p-3 tile rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={currentAddOnIds.includes(addOn.id)}
                      onCheckedChange={() => handleAddOnToggle(addOn.id)}
                    />
                    <div>
                      <span className="font-medium text-foreground">{addOn.name}</span>
                      <p className="text-sm text-muted-foreground">{addOn.description}</p>
                    </div>
                  </div>
                  <span className="font-medium text-foreground">+${addOn.price}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Total */}
      <Card style={{ background: "var(--electric-glow)" }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Service Total</h3>
              <p className="text-sm text-muted-foreground">
                {selectedService?.name}
                {currentAddOnIds.length > 0 && ` + ${currentAddOnIds.length} add-on${currentAddOnIds.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">${calculateTotal().toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">
                Estimated {selectedService ? formatDuration(selectedService.duration) : '—'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!currentServiceId}
          className="flex-1 bg-electric text-white hover:bg-electric-dim"
        >
          Continue to Date & Time
        </Button>
      </div>
    </div>
  );
}
