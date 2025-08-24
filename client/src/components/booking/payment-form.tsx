import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Lock, Calendar, MapPin, Car } from "lucide-react";
import { Service, AddOnService } from "@shared/schema";

interface PaymentFormProps {
  bookingData: any;
  service?: Service;
  addOns: AddOnService[];
  onComplete: () => void;
  isLoading: boolean;
}

export function PaymentForm({ 
  bookingData, 
  service, 
  addOns, 
  onComplete, 
  isLoading 
}: PaymentFormProps) {
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    billingZip: ""
  });

  const handlePaymentChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      handlePaymentChange('cardNumber', formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      handlePaymentChange('expiryDate', formatted);
    }
  };

  const isFormValid = () => {
    return paymentData.cardNumber.replace(/\s/g, '').length === 16 &&
           paymentData.expiryDate.length === 5 &&
           paymentData.cvv.length >= 3 &&
           paymentData.nameOnCard.trim() !== '' &&
           paymentData.billingZip.length >= 5;
  };

  const calculateSubtotal = () => {
    let total = 0;
    if (service) {
      total += parseFloat(service.basePrice);
    }
    addOns.forEach(addOn => {
      total += parseFloat(addOn.price);
    });
    return total;
  };

  const subtotal = calculateSubtotal();
  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + serviceFee;

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h2>
          <div className="space-y-4">
            {/* Service Details */}
            {service && (
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
                <span className="font-medium text-gray-900">${service.basePrice}</span>
              </div>
            )}

            {/* Add-ons */}
            {addOns.map((addOn) => (
              <div key={addOn.id} className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{addOn.name}</h4>
                  <p className="text-sm text-gray-600">{addOn.description}</p>
                </div>
                <span className="font-medium text-gray-900">${addOn.price}</span>
              </div>
            ))}

            <Separator />

            {/* Date and Time */}
            {bookingData.scheduledAt && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(bookingData.scheduledAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} at {new Date(bookingData.scheduledAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
            )}

            {/* Location */}
            {bookingData.customerLocation && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{bookingData.customerLocation.address}</span>
              </div>
            )}

            {/* Vehicle */}
            {bookingData.vehicleInfo && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Car className="w-4 h-4" />
                <span>
                  {bookingData.vehicleInfo.year} {bookingData.vehicleInfo.make} {bookingData.vehicleInfo.model}
                  {bookingData.vehicleInfo.color && ` (${bookingData.vehicleInfo.color})`}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Information
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                value={paymentData.cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  value={paymentData.expiryDate}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  value={paymentData.cvv}
                  onChange={(e) => handlePaymentChange('cvv', e.target.value.replace(/\D/g, ''))}
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="nameOnCard">Name on Card *</Label>
              <Input
                id="nameOnCard"
                value={paymentData.nameOnCard}
                onChange={(e) => handlePaymentChange('nameOnCard', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="billingZip">Billing ZIP Code *</Label>
              <Input
                id="billingZip"
                value={paymentData.billingZip}
                onChange={(e) => handlePaymentChange('billingZip', e.target.value.replace(/\D/g, ''))}
                placeholder="12345"
                maxLength={5}
                required
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              <Lock className="w-4 h-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Fee</span>
              <span className="font-medium">${serviceFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isLoading}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={onComplete}
          disabled={!isFormValid() || isLoading}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isLoading ? "Processing..." : `Confirm Booking - $${total.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}
