import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, DollarSign } from "lucide-react";
import { Service, AddOnService } from "@shared/schema";

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
      case 'detailing': return '🚗';
      case 'mechanical': return '🔧';
      case 'maintenance': return '⚙️';
      default: return '📋';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'detailing': return 'bg-blue-100 text-blue-800';
      case 'mechanical': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Selection */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Service</h2>
          <div className="space-y-4">
            {services.map((service) => (
              <label
                key={service.id}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                  currentServiceId === service.id 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="service"
                    checked={currentServiceId === service.id}
                    onChange={() => setCurrentServiceId(service.id)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <Badge className={getCategoryColor(service.category)}>
                        {getCategoryIcon(service.category)} {service.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {Math.round(service.duration / 60)} hour{service.duration >= 120 ? 's' : ''}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Mobile service
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">${service.basePrice}</div>
                  <div className="text-sm text-gray-500">Starting price</div>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add-On Services</h3>
            <div className="space-y-3">
              {addOns.map((addOn) => (
                <label
                  key={addOn.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={currentAddOnIds.includes(addOn.id)}
                      onCheckedChange={() => handleAddOnToggle(addOn.id)}
                    />
                    <div>
                      <span className="font-medium text-gray-900">{addOn.name}</span>
                      <p className="text-sm text-gray-600">{addOn.description}</p>
                    </div>
                  </div>
                  <span className="font-medium text-gray-900">+${addOn.price}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Total */}
      <Card className="bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Service Total</h3>
              <p className="text-sm text-gray-600">
                {selectedService?.name}
                {currentAddOnIds.length > 0 && ` + ${currentAddOnIds.length} add-on${currentAddOnIds.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">${calculateTotal().toFixed(2)}</div>
              <div className="text-sm text-gray-600">
                Estimated {selectedService ? Math.round(selectedService.duration / 60) : 0} hour{selectedService && selectedService.duration >= 120 ? 's' : ''}
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
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Continue to Date & Time
        </Button>
      </div>
    </div>
  );
}
