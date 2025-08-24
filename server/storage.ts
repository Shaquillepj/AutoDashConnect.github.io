import { 
  type User, 
  type InsertUser,
  type ServiceProvider,
  type InsertServiceProvider,
  type Service,
  type InsertService,
  type AddOnService,
  type InsertAddOnService,
  type Booking,
  type InsertBooking,
  type Review,
  type InsertReview,
  type Inventory,
  type InsertInventory,
  type EmergencyRequest,
  type InsertEmergencyRequest
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Service Providers
  getServiceProvider(id: string): Promise<ServiceProvider | undefined>;
  getServiceProviderByUserId(userId: string): Promise<ServiceProvider | undefined>;
  createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider>;
  getServiceProvidersInRadius(lat: number, lng: number, radius: number): Promise<ServiceProvider[]>;
  updateServiceProvider(id: string, updates: Partial<ServiceProvider>): Promise<ServiceProvider | undefined>;

  // Services
  getService(id: string): Promise<Service | undefined>;
  getServicesByProviderId(providerId: string): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, updates: Partial<Service>): Promise<Service | undefined>;

  // Add-on Services
  getAddOnsByServiceId(serviceId: string): Promise<AddOnService[]>;
  createAddOnService(addOn: InsertAddOnService): Promise<AddOnService>;

  // Bookings
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByCustomerId(customerId: string): Promise<Booking[]>;
  getBookingsByProviderId(providerId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined>;

  // Reviews
  getReviewsByProviderId(providerId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Inventory
  getInventoryByProviderId(providerId: string): Promise<Inventory[]>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: string, updates: Partial<Inventory>): Promise<Inventory | undefined>;

  // Emergency Requests
  getEmergencyRequest(id: string): Promise<EmergencyRequest | undefined>;
  getEmergencyRequestsByCustomerId(customerId: string): Promise<EmergencyRequest[]>;
  getEmergencyRequestsByProviderId(providerId: string): Promise<EmergencyRequest[]>;
  getPendingEmergencyRequests(): Promise<EmergencyRequest[]>;
  createEmergencyRequest(request: InsertEmergencyRequest): Promise<EmergencyRequest>;
  updateEmergencyRequest(id: string, updates: Partial<EmergencyRequest>): Promise<EmergencyRequest | undefined>;
  findNearestProviders(lat: number, lng: number, maxRadius: number): Promise<ServiceProvider[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private serviceProviders: Map<string, ServiceProvider> = new Map();
  private services: Map<string, Service> = new Map();
  private addOnServices: Map<string, AddOnService> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private reviews: Map<string, Review> = new Map();
  private inventory: Map<string, Inventory> = new Map();
  private emergencyRequests: Map<string, EmergencyRequest> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Create sample users
    const customer = {
      id: randomUUID(),
      email: "john.doe@example.com",
      password: "hashedpassword",
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      role: "customer",
      rewardPoints: 2450,
      createdAt: new Date(),
    };

    const providerUser = {
      id: randomUUID(),
      email: "elite@autodetailing.com",
      password: "hashedpassword",
      firstName: "Mike",
      lastName: "Johnson",
      phone: "+1234567891",
      role: "provider",
      rewardPoints: 0,
      createdAt: new Date(),
    };

    this.users.set(customer.id, customer);
    this.users.set(providerUser.id, providerUser);

    // Create sample service provider
    const provider = {
      id: randomUUID(),
      userId: providerUser.id,
      businessName: "Elite Auto Detailing",
      description: "Premium mobile detailing with ceramic coating and paint protection",
      serviceRadius: 25,
      rating: "4.9",
      reviewCount: 127,
      isActive: true,
      isAvailable: true,
      businessLicense: "DET-2024-001",
      insurance: "INS-2024-001",
      location: { lat: 40.7128, lng: -74.0060, address: "New York, NY" },
      latitude: "40.7128",
      longitude: "-74.0060",
    };

    this.serviceProviders.set(provider.id, provider);

    // Create sample services
    const detailService = {
      id: randomUUID(),
      providerId: provider.id,
      name: "Premium Detail Package",
      description: "Complete interior and exterior detailing with ceramic coating protection",
      category: "detailing",
      basePrice: "150.00",
      duration: 180,
      isActive: true,
      requirements: ["Access to water", "Parking space"],
    };

    const washService = {
      id: randomUUID(),
      providerId: provider.id,
      name: "Express Wash & Vacuum",
      description: "Quick exterior wash and interior vacuum service",
      category: "detailing",
      basePrice: "45.00",
      duration: 60,
      isActive: true,
      requirements: ["Access to water"],
    };

    this.services.set(detailService.id, detailService);
    this.services.set(washService.id, washService);

    // Create sample add-ons
    const engineAddon = {
      id: randomUUID(),
      serviceId: detailService.id,
      name: "Engine Bay Cleaning",
      description: "Deep clean and degrease engine compartment",
      price: "25.00",
      isActive: true,
    };

    const tireAddon = {
      id: randomUUID(),
      serviceId: detailService.id,
      name: "Tire Shine Treatment",
      description: "Premium tire conditioning and shine application",
      price: "15.00",
      isActive: true,
    };

    this.addOnServices.set(engineAddon.id, engineAddon);
    this.addOnServices.set(tireAddon.id, tireAddon);

    // Create sample inventory
    const shampoo = {
      id: randomUUID(),
      providerId: provider.id,
      itemName: "Premium Car Shampoo",
      currentStock: 12,
      minStock: 5,
      unit: "bottles",
      lastRestocked: new Date(),
    };

    const towels = {
      id: randomUUID(),
      providerId: provider.id,
      itemName: "Microfiber Towels",
      currentStock: 3,
      minStock: 5,
      unit: "packs",
      lastRestocked: new Date(),
    };

    this.inventory.set(shampoo.id, shampoo);
    this.inventory.set(towels.id, towels);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      rewardPoints: insertUser.rewardPoints || 0,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Service Providers
  async getServiceProvider(id: string): Promise<ServiceProvider | undefined> {
    return this.serviceProviders.get(id);
  }

  async getServiceProviderByUserId(userId: string): Promise<ServiceProvider | undefined> {
    return Array.from(this.serviceProviders.values()).find(sp => sp.userId === userId);
  }

  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> {
    const id = randomUUID();
    const serviceProvider: ServiceProvider = { ...provider, id };
    this.serviceProviders.set(id, serviceProvider);
    return serviceProvider;
  }

  async getServiceProvidersInRadius(lat: number, lng: number, radius: number): Promise<ServiceProvider[]> {
    // Simple implementation - in real app would use proper geospatial queries
    return Array.from(this.serviceProviders.values()).filter(sp => sp.isActive);
  }

  async updateServiceProvider(id: string, updates: Partial<ServiceProvider>): Promise<ServiceProvider | undefined> {
    const provider = this.serviceProviders.get(id);
    if (!provider) return undefined;
    
    const updatedProvider = { ...provider, ...updates };
    this.serviceProviders.set(id, updatedProvider);
    return updatedProvider;
  }

  // Services
  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServicesByProviderId(providerId: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(s => s.providerId === providerId && s.isActive);
  }

  async createService(service: InsertService): Promise<Service> {
    const id = randomUUID();
    const newService: Service = { ...service, id };
    this.services.set(id, newService);
    return newService;
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...updates };
    this.services.set(id, updatedService);
    return updatedService;
  }

  // Add-on Services
  async getAddOnsByServiceId(serviceId: string): Promise<AddOnService[]> {
    return Array.from(this.addOnServices.values()).filter(addon => addon.serviceId === serviceId && addon.isActive);
  }

  async createAddOnService(addOn: InsertAddOnService): Promise<AddOnService> {
    const id = randomUUID();
    const newAddOn: AddOnService = { ...addOn, id };
    this.addOnServices.set(id, newAddOn);
    return newAddOn;
  }

  // Bookings
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByCustomerId(customerId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.customerId === customerId);
  }

  async getBookingsByProviderId(providerId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.providerId === providerId);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const newBooking: Booking = { 
      ...booking, 
      id, 
      createdAt: new Date(),
      completedAt: null
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...updates };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Reviews
  async getReviewsByProviderId(providerId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.providerId === providerId);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = randomUUID();
    const newReview: Review = { ...review, id, createdAt: new Date() };
    this.reviews.set(id, newReview);
    return newReview;
  }

  // Inventory
  async getInventoryByProviderId(providerId: string): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).filter(i => i.providerId === providerId);
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const id = randomUUID();
    const newItem: Inventory = { ...item, id, lastRestocked: new Date() };
    this.inventory.set(id, newItem);
    return newItem;
  }

  async updateInventoryItem(id: string, updates: Partial<Inventory>): Promise<Inventory | undefined> {
    const item = this.inventory.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates };
    this.inventory.set(id, updatedItem);
    return updatedItem;
  }

  // Emergency Requests
  async getEmergencyRequest(id: string): Promise<EmergencyRequest | undefined> {
    return this.emergencyRequests.get(id);
  }

  async getEmergencyRequestsByCustomerId(customerId: string): Promise<EmergencyRequest[]> {
    return Array.from(this.emergencyRequests.values()).filter(r => r.customerId === customerId);
  }

  async getEmergencyRequestsByProviderId(providerId: string): Promise<EmergencyRequest[]> {
    return Array.from(this.emergencyRequests.values()).filter(r => r.providerId === providerId);
  }

  async getPendingEmergencyRequests(): Promise<EmergencyRequest[]> {
    return Array.from(this.emergencyRequests.values()).filter(r => r.status === 'pending');
  }

  async createEmergencyRequest(request: InsertEmergencyRequest): Promise<EmergencyRequest> {
    const id = randomUUID();
    const newRequest: EmergencyRequest = { 
      ...request, 
      id, 
      createdAt: new Date(),
      assignedAt: null,
      arrivedAt: null,
      completedAt: null
    };
    this.emergencyRequests.set(id, newRequest);
    return newRequest;
  }

  async updateEmergencyRequest(id: string, updates: Partial<EmergencyRequest>): Promise<EmergencyRequest | undefined> {
    const request = this.emergencyRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...updates };
    if (updates.status === 'assigned' && !request.assignedAt) {
      updatedRequest.assignedAt = new Date();
    }
    if (updates.status === 'arrived' && !request.arrivedAt) {
      updatedRequest.arrivedAt = new Date();
    }
    if (updates.status === 'completed' && !request.completedAt) {
      updatedRequest.completedAt = new Date();
    }
    
    this.emergencyRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async findNearestProviders(lat: number, lng: number, maxRadius: number = 50): Promise<ServiceProvider[]> {
    const providers = Array.from(this.serviceProviders.values()).filter(p => p.isAvailable);
    
    return providers
      .map(provider => ({
        provider,
        distance: this.calculateDistance(lat, lng, provider.latitude, provider.longitude)
      }))
      .filter(({ distance }) => distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance)
      .map(({ provider }) => provider);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export const storage = new MemStorage();
