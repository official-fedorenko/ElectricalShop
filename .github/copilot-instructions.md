<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# LessElectrical Shop - Copilot Instructions

This is a modern electronics store frontend built with React, TypeScript, and Tailwind CSS.

## Project Structure

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons

## Key Features

- Responsive design with mobile-first approach
- Authentication system with role-based access (admin/user)
- Product catalog with filtering and search
- Admin panel for product management
- Modern UI components and animations

## Code Style Guidelines

- Use TypeScript interfaces for type definitions
- Prefer functional components with hooks
- Use Tailwind CSS utility classes for styling
- Follow React best practices for state management
- Use type imports with `import type` for TypeScript types

## Available Routes

- `/` - Home page with product catalog
- `/login` - User login page
- `/register` - User registration page
- `/admin` - Admin panel (protected route)

## Authentication

- Mock authentication system for demonstration
- Test users: `admin@shop.com` (admin), `user@shop.com` (user)
- Role-based route protection
