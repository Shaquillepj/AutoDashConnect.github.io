import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertServiceProviderSchema,
  insertServiceSchema,
  insertBookingSchema,
  insertReviewSchema,
  insertInventorySchema,
  insertEmergencyRequestSchema
} from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // In a real app, you'd set up sessions/JWT here
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // User routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.patch('/api/users/:id', async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Service provider routes
  app.get('/api/providers', async (req, res) => {
    try {
      const { lat, lng, radius = 25 } = req.query;
      const providers = await storage.getServiceProvidersInRadius(
        parseFloat(lat as string), 
        parseFloat(lng as string), 
        parseInt(radius as string)
      );
      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/providers/:id', async (req, res) => {
    try {
      const provider = await storage.getServiceProvider(req.params.id);
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      res.json(provider);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/providers/user/:userId', async (req, res) => {
    try {
      const provider = await storage.getServiceProviderByUserId(req.params.userId);
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      res.json(provider);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/providers', async (req, res) => {
    try {
      const providerData = insertServiceProviderSchema.parse(req.body);
      const provider = await storage.createServiceProvider(providerData);
      res.status(201).json(provider);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // Service routes
  app.get('/api/providers/:providerId/services', async (req, res) => {
    try {
      const services = await storage.getServicesByProviderId(req.params.providerId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/services/:id', async (req, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/services', async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.get('/api/services/:id/addons', async (req, res) => {
    try {
      const addOns = await storage.getAddOnsByServiceId(req.params.id);
      res.json(addOns);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Booking routes
  app.get('/api/bookings/customer/:customerId', async (req, res) => {
    try {
      const bookings = await storage.getBookingsByCustomerId(req.params.customerId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/bookings/provider/:providerId', async (req, res) => {
    try {
      const bookings = await storage.getBookingsByProviderId(req.params.providerId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/bookings', async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.patch('/api/bookings/:id', async (req, res) => {
    try {
      const updates = req.body;
      const booking = await storage.updateBooking(req.params.id, updates);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Review routes
  app.get('/api/providers/:providerId/reviews', async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProviderId(req.params.providerId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // Inventory routes
  app.get('/api/providers/:providerId/inventory', async (req, res) => {
    try {
      const inventory = await storage.getInventoryByProviderId(req.params.providerId);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/inventory', async (req, res) => {
    try {
      const inventoryData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(inventoryData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.patch('/api/inventory/:id', async (req, res) => {
    try {
      const updates = req.body;
      const item = await storage.updateInventoryItem(req.params.id, updates);
      if (!item) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Emergency Request routes
  app.get('/api/emergency-requests/:id', async (req, res) => {
    try {
      const request = await storage.getEmergencyRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: 'Emergency request not found' });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/emergency-requests/customer/:customerId', async (req, res) => {
    try {
      const requests = await storage.getEmergencyRequestsByCustomerId(req.params.customerId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/emergency-requests/provider/:providerId', async (req, res) => {
    try {
      const requests = await storage.getEmergencyRequestsByProviderId(req.params.providerId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/emergency-requests', async (req, res) => {
    try {
      const requests = await storage.getPendingEmergencyRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/emergency-requests', async (req, res) => {
    try {
      const requestData = insertEmergencyRequestSchema.parse(req.body);
      const request = await storage.createEmergencyRequest(requestData);
      
      // Auto-route to nearest providers
      const location = requestData.customerLocation as { lat: number; lng: number; address: string };
      const nearbyProviders = await storage.findNearestProviders(location.lat, location.lng, 50);
      
      res.status(201).json({ 
        request,
        nearbyProviders: nearbyProviders.slice(0, 5) // Return top 5 nearest providers
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.patch('/api/emergency-requests/:id', async (req, res) => {
    try {
      const updates = req.body;
      const request = await storage.updateEmergencyRequest(req.params.id, updates);
      if (!request) {
        return res.status(404).json({ message: 'Emergency request not found' });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/emergency-requests/:id/assign', async (req, res) => {
    try {
      const { providerId } = req.body;
      const request = await storage.updateEmergencyRequest(req.params.id, { 
        providerId, 
        status: 'assigned',
        assignedAt: new Date()
      });
      if (!request) {
        return res.status(404).json({ message: 'Emergency request not found' });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
