import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/navigation/header";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Clock, DollarSign, Car, Wrench, Settings, X, ClipboardList } from "lucide-react";
import { Service, ServiceProvider } from "@shared/schema";
import { formatDuration } from "@/lib/utils";

const CATEGORIES = [
  { value: "detailing", label: "Detailing", icon: Car },
  { value: "mechanical", label: "Mechanical", icon: Wrench },
  { value: "maintenance", label: "Maintenance", icon: Settings },
] as const;

// Friendly duration buckets instead of asking providers to guess exact minutes —
// especially unrealistic for detailing, where job length varies with vehicle size/condition.
const DURATION_PRESETS = [30, 60, 90, 120, 180, 240];

export default function ProviderServices() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [requirementInput, setRequirementInput] = useState("");
  const [serviceForm, setServiceForm] = useState<{
    name: string;
    description: string;
    category: string;
    basePrice: string;
    duration: number | null;
    requirements: string[];
  }>({
    name: "",
    description: "",
    category: "",
    basePrice: "",
    duration: null,
    requirements: []
  });

  const { data: provider } = useQuery<ServiceProvider>({
    queryKey: ['/api/providers/user', user?.id],
    enabled: !!user?.id
  });

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['/api/providers', provider?.id, 'services'],
    enabled: !!provider?.id
  });

  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      const response = await apiRequest('POST', '/api/services', serviceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers', provider?.id, 'services'] });
      setIsAddDialogOpen(false);
      setServiceForm({
        name: "",
        description: "",
        category: "",
        basePrice: "",
        duration: null,
        requirements: []
      });
      setRequirementInput("");
      toast({
        title: "Service added",
        description: "New service has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add service. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !serviceForm.category || !serviceForm.duration) return;

    const serviceData = {
      providerId: provider.id,
      name: serviceForm.name,
      description: serviceForm.description,
      category: serviceForm.category,
      basePrice: serviceForm.basePrice,
      duration: serviceForm.duration,
      requirements: serviceForm.requirements,
      isActive: true
    };

    createServiceMutation.mutate(serviceData);
  };

  const addRequirement = () => {
    const value = requirementInput.trim();
    if (value && !serviceForm.requirements.includes(value)) {
      setServiceForm(prev => ({ ...prev, requirements: [...prev.requirements, value] }));
    }
    setRequirementInput("");
  };

  const removeRequirement = (value: string) => {
    setServiceForm(prev => ({ ...prev, requirements: prev.requirements.filter(r => r !== value) }));
  };

  const getCategoryIcon = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.icon ?? ClipboardList;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Services</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Manage your service offerings and pricing</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-electric text-white hover:bg-electric-dim">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Service</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label>Category</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1.5">
                      {CATEGORIES.map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setServiceForm(prev => ({ ...prev, category: value }))}
                          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-colors ${
                            serviceForm.category === value
                              ? 'border-electric bg-electric/5'
                              : 'border-border hover:border-electric/50'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${serviceForm.category === value ? 'text-electric' : 'text-muted-foreground'}`} />
                          <span className={`text-xs font-medium ${serviceForm.category === value ? 'text-electric' : 'text-foreground'}`}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Premium Detail Package"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="basePrice">Base Price ($)</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      value={serviceForm.basePrice}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, basePrice: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label>How long does this usually take?</Label>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      A rough estimate is fine — this just blocks time on your schedule.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DURATION_PRESETS.map((minutes) => (
                        <button
                          key={minutes}
                          type="button"
                          onClick={() => setServiceForm(prev => ({ ...prev, duration: minutes }))}
                          className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                            serviceForm.duration === minutes
                              ? 'border-electric bg-electric/5 text-electric'
                              : 'border-border text-muted-foreground hover:border-electric/50'
                          }`}
                        >
                          {formatDuration(minutes)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requirements">Requirements</Label>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Anything you need from the customer (optional)
                    </p>
                    <div className="flex gap-2">
                      <Input
                        id="requirements"
                        value={requirementInput}
                        onChange={(e) => setRequirementInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addRequirement();
                          }
                        }}
                        placeholder="e.g., Access to water"
                      />
                      <Button type="button" variant="outline" onClick={addRequirement}>
                        Add
                      </Button>
                    </div>
                    {serviceForm.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {serviceForm.requirements.map((req) => (
                          <span key={req} className="tile inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-medium text-foreground">
                            {req}
                            <button
                              type="button"
                              onClick={() => removeRequirement(req)}
                              aria-label={`Remove ${req}`}
                              className="rounded-full hover:bg-surface-overlay"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!serviceForm.category || !serviceForm.duration || createServiceMutation.isPending}
                      className="flex-1 bg-electric text-white hover:bg-electric-dim"
                    >
                      {createServiceMutation.isPending ? "Adding..." : "Add Service"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-surface rounded-2xl p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : services && services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const CategoryIcon = getCategoryIcon(service.category);
              return (
              <div key={service.id} className="card-surface rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                  <Badge variant="secondary" className="capitalize">
                    {service.category}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">{service.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span>Starting at ${service.basePrice}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(service.duration)}</span>
                  </div>
                </div>

                {service.requirements && service.requirements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {service.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Badge variant={service.isActive ? "default" : "secondary"}>
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="card-surface rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No services yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first service to start accepting bookings</p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-electric text-white hover:bg-electric-dim">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Service
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
