# Overview

This is a full-stack automotive services platform called "AutoCare Pro" that connects customers with mobile automotive service providers. The application enables customers to book various automotive services (detailing, oil changes, brake service, etc.) and allows service providers to manage their business operations through a dedicated dashboard.

The platform operates as a two-sided marketplace where customers can browse available services, book appointments, and track their service history, while service providers can manage their service offerings, schedule, and customer bookings. The system includes location-based matching to connect customers with nearby service providers within their service radius.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom automotive-themed color variables
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management, custom hooks for authentication state
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with route-based organization
- **Error Handling**: Centralized error middleware with structured error responses
- **Request Logging**: Custom middleware for API request/response logging

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Data Validation**: Drizzle-Zod integration for runtime schema validation

## Authentication and Authorization
- **Authentication Strategy**: Simple email/password authentication (development-ready)
- **Session Management**: In-memory user state with polling-based updates
- **Role-Based Access**: Customer and Provider roles with route-level access control
- **Security**: Basic credential validation with plans for session/JWT implementation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database driver for Neon
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library for React

### UI and Styling
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **tsx**: TypeScript execution environment for development
- **esbuild**: Fast JavaScript bundler for production builds
- **vite**: Frontend build tool and development server
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Form and Validation
- **react-hook-form**: Performant forms with easy validation
- **@hookform/resolvers**: Validation resolvers for React Hook Form
- **zod**: TypeScript-first schema validation library

The architecture follows a monorepo structure with shared types and schemas between frontend and backend, enabling full-stack type safety. The application is designed for mobile-first usage with responsive design patterns and includes specialized interfaces for both customer and service provider user types.