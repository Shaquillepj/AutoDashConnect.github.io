import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { MapPin, Clock, Phone, User, Car, AlertCircle, CheckCircle, Navigation, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { EmergencyRequest, ServiceProvider } from "@shared/schema";

export default function EmergencyTrackingPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [estimatedArrival, setEstimatedArrival] = useState<string>("");

  const { data: emergencyRequest, isLoading } = useQuery({
    queryKey: ['/api/emergency-requests', id],
    queryFn: async (): Promise<EmergencyRequest> => {
      return apiRequest(`/api/emergency-requests/${id}`);
    },
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  const { data: provider } = useQuery({
    queryKey: ['/api/providers', emergencyRequest?.providerId],
    queryFn: async (): Promise<ServiceProvider> => {
      return apiRequest(`/api/providers/${emergencyRequest?.providerId}`);
    },
    enabled: !!emergencyRequest?.providerId,
  });

  const cancelRequest = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/emergency-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' })
      });
    },
    onSuccess: () => {
      toast({
        title: "Request cancelled",
        description: "Your emergency request has been cancelled"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-requests'] });
      setLocation('/customer');
    }
  });

  useEffect(() => {
    if (emergencyRequest?.estimatedArrival) {
      const arrival = new Date(emergencyRequest.estimatedArrival);
      const now = new Date();
      const diff = arrival.getTime() - now.getTime();
      
      if (diff > 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        setEstimatedArrival(`${minutes} minutes`);
      } else {
        setEstimatedArrival("Arrived");
      }
    }
  }, [emergencyRequest]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-2xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!emergencyRequest) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-2xl">
        <Card className="text-center">
          <CardContent className="pt-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Request Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The emergency request could not be found.
            </p>
            <Button onClick={() => setLocation('/customer')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'en_route':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'arrived':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Finding Provider';
      case 'assigned':
        return 'Provider Assigned';
      case 'en_route':
        return 'Provider En Route';
      case 'arrived':
        return 'Provider Arrived';
      case 'in_progress':
        return 'Service in Progress';
      case 'completed':
        return 'Service Completed';
      case 'cancelled':
        return 'Request Cancelled';
      default:
        return status;
    }
  };

  const getIssueTypeIcon = (issueType: string) => {
    switch (issueType) {
      case 'flat_tire':
        return '🚗';
      case 'dead_battery':
        return '🔋';
      case 'lockout':
        return '🔒';
      case 'towing':
        return '🚛';
      case 'engine_trouble':
        return '⚙️';
      case 'accident':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const vehicleInfo = emergencyRequest.vehicleInfo as any;
  const location = emergencyRequest.customerLocation as any;

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Emergency Request Tracking
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Request ID: {emergencyRequest.id.slice(0, 8)}...
        </p>
      </div>

      {/* Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-2xl">{getIssueTypeIcon(emergencyRequest.issueType)}</span>
              Request Status
            </span>
            <Badge className={getStatusColor(emergencyRequest.status)}>
              {getStatusText(emergencyRequest.status)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg capitalize mb-1">
                {emergencyRequest.issueType.replace('_', ' ')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {emergencyRequest.description}
              </p>
            </div>

            {emergencyRequest.status !== 'pending' && estimatedArrival && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium">ETA: {estimatedArrival}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Provider Info */}
      {provider && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Service Provider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{provider.businessName}</h3>
                <p className="text-gray-600 dark:text-gray-300">{provider.description}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium">{provider.rating}</span>
                  <span className="text-gray-500">({provider.reviewCount} reviews)</span>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Provider
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle & Location Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Vehicle & Location Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Vehicle Information</h4>
              <p className="text-gray-600 dark:text-gray-300">
                {vehicleInfo?.year} {vehicleInfo?.make} {vehicleInfo?.model} ({vehicleInfo?.color})
                {vehicleInfo?.plateNumber && ` - ${vehicleInfo.plateNumber}`}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Your Location
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {location?.address}
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                <Navigation className="w-4 h-4 mr-2" />
                Share Live Location
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Service Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Request Submitted</p>
                <p className="text-sm text-gray-500">
                  {new Date(emergencyRequest.createdAt!).toLocaleString()}
                </p>
              </div>
            </div>

            {emergencyRequest.assignedAt && (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Provider Assigned</p>
                  <p className="text-sm text-gray-500">
                    {new Date(emergencyRequest.assignedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {emergencyRequest.arrivedAt && (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Provider Arrived</p>
                  <p className="text-sm text-gray-500">
                    {new Date(emergencyRequest.arrivedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {emergencyRequest.completedAt && (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Service Completed</p>
                  <p className="text-sm text-gray-500">
                    {new Date(emergencyRequest.completedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => setLocation('/customer')}
          className="flex-1"
        >
          Back to Dashboard
        </Button>
        {emergencyRequest.status === 'pending' && (
          <Button
            variant="destructive"
            onClick={() => cancelRequest.mutate()}
            disabled={cancelRequest.isPending}
            className="flex-1"
          >
            Cancel Request
          </Button>
        )}
      </div>
    </div>
  );
}