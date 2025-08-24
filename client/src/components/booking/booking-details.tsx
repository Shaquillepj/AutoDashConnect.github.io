import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Car } from "lucide-react";

interface BookingDetailsProps {
  onComplete: (data: {
    customerLocation: {
      lat: number;
      lng: number;
      address: string;
    };
    vehicleInfo: {
      make: string;
      model: string;
      year: string;
      color: string;
      plateNumber: string;
    };
    notes: string;
  }) => void;
}

export function BookingDetails({ onComplete }: BookingDetailsProps) {
  const [address, setAddress] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    plateNumber: ""
  });
  const [notes, setNotes] = useState("");

  const handleVehicleChange = (field: string, value: string) => {
    setVehicleInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    if (address && vehicleInfo.make && vehicleInfo.model && vehicleInfo.year) {
      onComplete({
        customerLocation: {
          lat: 40.7128, // Mock coordinates - in real app would use geocoding
          lng: -74.0060,
          address
        },
        vehicleInfo,
        notes
      });
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const carMakes = [
    "Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes-Benz",
    "Audi", "Volkswagen", "Hyundai", "Kia", "Mazda", "Subaru", "Lexus",
    "Acura", "Infiniti", "Cadillac", "Lincoln", "Buick", "GMC", "Jeep",
    "Ram", "Dodge", "Chrysler", "Tesla", "Volvo", "Jaguar", "Land Rover",
    "Porsche", "Mini", "Mitsubishi", "Other"
  ];

  const colors = [
    "Black", "White", "Silver", "Gray", "Red", "Blue", "Green", "Brown",
    "Gold", "Yellow", "Orange", "Purple", "Pink", "Tan", "Beige", "Other"
  ];

  return (
    <div className="space-y-6">
      {/* Service Location */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Service Location
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete address"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Our technician will come to this location for your service
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Car className="w-5 h-5 mr-2" />
            Vehicle Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">Make *</Label>
              <Select
                value={vehicleInfo.make}
                onValueChange={(value) => handleVehicleChange('make', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select make" />
                </SelectTrigger>
                <SelectContent>
                  {carMakes.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={vehicleInfo.model}
                onChange={(e) => handleVehicleChange('model', e.target.value)}
                placeholder="e.g., Camry, Civic, F-150"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="year">Year *</Label>
              <Select
                value={vehicleInfo.year}
                onValueChange={(value) => handleVehicleChange('year', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="color">Color</Label>
              <Select
                value={vehicleInfo.color}
                onValueChange={(value) => handleVehicleChange('color', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="plateNumber">License Plate Number</Label>
              <Input
                id="plateNumber"
                value={vehicleInfo.plateNumber}
                onChange={(e) => handleVehicleChange('plateNumber', e.target.value)}
                placeholder="e.g., ABC-1234"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
          <div>
            <Label htmlFor="notes">Special Instructions or Requests</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions, access codes, or specific areas of concern..."
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Help us provide the best service by sharing any relevant details
            </p>
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
          disabled={!address || !vehicleInfo.make || !vehicleInfo.model || !vehicleInfo.year}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
