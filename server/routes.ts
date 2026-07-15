import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
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

// Flat rates in USD per emergency issue type — committed price shown to driver before dispatch
const EMERGENCY_FLAT_RATES: Record<string, number> = {
  flat_tire: 75,
  dead_battery: 65,
  lockout: 60,
  towing: 120,
  engine_trouble: 95,
  accident: 95,
  other: 85,
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' },
});

function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.session.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

async function isProviderOwner(providerId: string, sessionUserId: string | undefined): Promise<boolean> {
  if (!sessionUserId) return false;
  const provider = await storage.getServiceProvider(providerId);
  return !!provider && provider.userId === sessionUserId;
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Auth routes
  app.post('/api/auth/login', loginLimiter, async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.session.userId = user.id;
      req.session.role = user.role;
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const passwordHash = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({ ...userData, password: passwordHash });

      req.session.userId = user.id;
      req.session.role = user.role;
      res.status(201).json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: 'Failed to log out' });
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out' });
    });
  });

  // User routes
  app.get('/api/users/:id', requireAuth, async (req, res) => {
    try {
      if (req.session.userId !== req.params.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.patch('/api/users/:id', requireAuth, async (req, res) => {
    try {
      if (req.session.userId !== req.params.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      // Client may only edit their own contact info — never role, email, password, or rewardPoints.
      const updates = pick(req.body ?? {}, ['firstName', 'lastName', 'phone']);
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

  app.get('/api/providers/user/:userId', requireAuth, async (req, res) => {
    try {
      if (req.session.userId !== req.params.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const provider = await storage.getServiceProviderByUserId(req.params.userId);
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      res.json(provider);
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

  app.post('/api/providers', requireAuth, async (req, res) => {
    try {
      const providerData = insertServiceProviderSchema.parse(req.body);
      if (providerData.userId !== req.session.userId) {
        return res.status(403).json({ message: 'Cannot create a provider profile for another user' });
      }
      const provider = await storage.createServiceProvider(providerData);
      res.status(201).json(provider);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // Mark a provider as verified (admin action)
  app.post('/api/providers/:id/verify', requireRole('admin'), async (req, res) => {
    try {
      const provider = await storage.updateServiceProvider(req.params.id, {
        isVerified: true,
        verifiedAt: new Date(),
      });
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      res.json(provider);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Provider updates their current location and availability together
  app.patch('/api/providers/:id/location', requireAuth, async (req, res) => {
    try {
      if (!(await isProviderOwner(req.params.id, req.session.userId))) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const { lat, lng, address, isAvailable } = z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string(),
        isAvailable: z.boolean().optional(),
      }).parse(req.body);

      const updates: any = {
        latitude: lat.toString(),
        longitude: lng.toString(),
        location: { lat, lng, address },
        locationUpdatedAt: new Date(),
      };
      if (isAvailable !== undefined) updates.isAvailable = isAvailable;

      const provider = await storage.updateServiceProvider(req.params.id, updates);
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      res.json(provider);
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

  app.post('/api/services', requireAuth, async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      if (!(await isProviderOwner(serviceData.providerId, req.session.userId))) {
        return res.status(403).json({ message: 'Forbidden' });
      }
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
  app.get('/api/bookings/customer/:customerId', requireAuth, async (req, res) => {
    try {
      if (req.session.userId !== req.params.customerId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const bookings = await storage.getBookingsByCustomerId(req.params.customerId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/bookings/provider/:providerId', requireAuth, async (req, res) => {
    try {
      if (!(await isProviderOwner(req.params.providerId, req.session.userId))) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const bookings = await storage.getBookingsByProviderId(req.params.providerId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/bookings', requireAuth, async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      if (bookingData.customerId !== req.session.userId) {
        return res.status(403).json({ message: 'Cannot create a booking for another customer' });
      }
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.patch('/api/bookings/:id', requireAuth, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      const isCustomer = booking.customerId === req.session.userId;
      const isProvider = await isProviderOwner(booking.providerId, req.session.userId);
      if (!isCustomer && !isProvider) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const updates = pick(req.body ?? {}, ['status', 'notes']);
      const updated = await storage.updateBooking(req.params.id, updates);
      res.json(updated);
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

  app.post('/api/reviews', requireAuth, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      if (reviewData.customerId !== req.session.userId) {
        return res.status(403).json({ message: 'Cannot submit a review for another customer' });
      }
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // Inventory routes
  app.get('/api/providers/:providerId/inventory', requireAuth, async (req, res) => {
    try {
      if (!(await isProviderOwner(req.params.providerId, req.session.userId))) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const inventory = await storage.getInventoryByProviderId(req.params.providerId);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/inventory', requireAuth, async (req, res) => {
    try {
      const inventoryData = insertInventorySchema.parse(req.body);
      if (!(await isProviderOwner(inventoryData.providerId, req.session.userId))) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const item = await storage.createInventoryItem(inventoryData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.patch('/api/inventory/:id', requireAuth, async (req, res) => {
    try {
      const item = await storage.getInventoryItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }
      if (!(await isProviderOwner(item.providerId, req.session.userId))) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const updates = pick(req.body ?? {}, ['currentStock', 'minStock', 'unit', 'itemName']);
      const updated = await storage.updateInventoryItem(req.params.id, updates);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Emergency Request routes — specific paths before generic /:id
  app.get('/api/emergency-requests/customer/:customerId', requireAuth, async (req, res) => {
    try {
      if (req.session.userId !== req.params.customerId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const requests = await storage.getEmergencyRequestsByCustomerId(req.params.customerId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/emergency-requests/provider/:providerId', requireAuth, async (req, res) => {
    try {
      if (!(await isProviderOwner(req.params.providerId, req.session.userId))) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const requests = await storage.getEmergencyRequestsByProviderId(req.params.providerId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Pending job board — any authenticated provider can see unassigned requests to pick up
  app.get('/api/emergency-requests', requireAuth, async (req, res) => {
    try {
      const requests = await storage.getPendingEmergencyRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/emergency-requests/:id', requireAuth, async (req, res) => {
    try {
      const request = await storage.getEmergencyRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: 'Emergency request not found' });
      }
      const isCustomer = request.customerId === req.session.userId;
      const isProvider = request.providerId
        ? await isProviderOwner(request.providerId, req.session.userId)
        : false;
      if (!isCustomer && !isProvider) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/emergency-requests', requireAuth, async (req, res) => {
    try {
      if (req.body.customerId !== req.session.userId) {
        return res.status(403).json({ message: 'Cannot submit a request for another customer' });
      }

      const quotedPrice = EMERGENCY_FLAT_RATES[req.body.issueType] ?? EMERGENCY_FLAT_RATES.other;
      const requestData = insertEmergencyRequestSchema.parse({
        ...req.body,
        totalAmount: quotedPrice.toString(),
      });

      const location = requestData.customerLocation as { lat: number; lng: number; address: string };
      const nearbyProviders = await storage.findNearestProviders(location.lat, location.lng, 50);

      if (nearbyProviders.length === 0) {
        return res.status(503).json({
          message: 'No providers available in your area right now.',
          suggestion: 'Try again in a few minutes or call 911 if this is a safety emergency.',
          quotedPrice,
          noProviders: true,
        });
      }

      const request = await storage.createEmergencyRequest(requestData);

      res.status(201).json({
        request,
        nearbyProviders: nearbyProviders.slice(0, 5),
        quotedPrice,
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.patch('/api/emergency-requests/:id', requireAuth, async (req, res) => {
    try {
      const request = await storage.getEmergencyRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: 'Emergency request not found' });
      }
      const isCustomer = request.customerId === req.session.userId;
      const isProvider = request.providerId
        ? await isProviderOwner(request.providerId, req.session.userId)
        : false;
      if (!isCustomer && !isProvider) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const updates = pick(req.body ?? {}, ['status', 'notes', 'estimatedArrival']);
      const updated = await storage.updateEmergencyRequest(req.params.id, updates);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/emergency-requests/:id/assign', requireAuth, async (req, res) => {
    try {
      const { providerId } = req.body;
      // A provider may only assign the request to themselves, never to another provider.
      if (!(await isProviderOwner(providerId, req.session.userId))) {
        return res.status(403).json({ message: 'Forbidden' });
      }
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
