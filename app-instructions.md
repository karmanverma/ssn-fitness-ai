# MVP Blocks App - Development Instructions

## Overview
MVP Blocks App is a Next.js application built with React 19, TypeScript, and Tailwind CSS. It features a comprehensive component library with shadcn/ui components, animations with Framer Motion, and various UI enhancements.

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation
```bash
npm install
```

### Development Server
Use the provided server management script for easy development:

```bash
# Start development server
./server.sh start

# Stop development server
./server.sh stop

# Restart development server
./server.sh restart

# Check server status
./server.sh status
```

The development server runs with Turbopack for faster builds and hot reloading.

## Available Commands

### Server Management Script (`./server.sh`)
- `start` - Start the development server with Turbopack
- `stop` - Stop the development server
- `restart` - Restart the development server
- `build` - Build the project for production
- `prod` - Start production server (builds if needed)
- `lint` - Run ESLint code linting
- `status` - Check if development server is running
- `logs` - View server logs (if available)
- `clean` - Clean build artifacts and cache
- `install` - Install npm dependencies

### Direct npm Commands
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Project Structure

```
mvp-blocks-app/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx        # Home page
│   │   └── about/          # About page
│   ├── components/         # React components
│   │   └── mvpblocks/      # MVP Blocks component library
│   │       └── required/   # Required components
│   │           └── headers/ # Header components
│   └── lib/                # Utility libraries
├── public/                 # Static assets
├── server.sh              # Server management script
└── package.json           # Dependencies and scripts
```

## Key Technologies

### Core Framework
- **Next.js 15.4.5** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type safety

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Notable Features
- **Turbopack** - Fast bundler for development
- **Dark/Light Theme** - Theme switching with next-themes
- **Form Handling** - React Hook Form with Zod validation
- **Animations** - Canvas confetti, particles, and smooth animations
- **Payment Integration** - Razorpay support
- **Email** - Resend integration

## Development Workflow

1. **Start Development**
   ```bash
   ./server.sh start
   ```
   Access the app at http://localhost:3000

2. **Make Changes**
   - Edit files in `src/` directory
   - Hot reloading will update the browser automatically

3. **Code Quality**
   ```bash
   ./server.sh lint    # Check for linting issues
   ```

4. **Build for Production**
   ```bash
   ./server.sh build   # Create production build
   ./server.sh prod    # Start production server
   ```

## Component Development

### MVP Blocks Components
Components are organized in `src/components/mvpblocks/`:
- `required/` - Essential components like headers, footers
- Follow the existing pattern for new components
- Use TypeScript for type safety
- Implement responsive design with Tailwind CSS

### Adding New Components
1. Create component file in appropriate directory
2. Export from index files for clean imports
3. Use shadcn/ui components as building blocks
4. Follow existing naming conventions

## Environment Setup

### Local Development
- Development server runs on port 3000
- Hot reloading enabled with Turbopack
- TypeScript checking in real-time

### Production Build
- Optimized bundle with Next.js
- Static generation where possible
- Performance optimizations enabled

## Troubleshooting

### Common Issues
1. **Port 3000 in use**
   ```bash
   ./server.sh stop    # Stop any running servers
   ./server.sh start   # Restart
   ```

2. **Build errors**
   ```bash
   ./server.sh clean   # Clean build cache
   ./server.sh install # Reinstall dependencies
   ```

3. **TypeScript errors**
   - Check for type mismatches
   - Ensure all imports are correct
   - Run `./server.sh lint` for detailed errors

### Performance
- Use Turbopack for faster development builds
- Leverage Next.js image optimization
- Implement proper code splitting

## Deployment

### Production Build
```bash
./server.sh build
```

### Environment Variables
Configure environment variables for:
- Database connections
- API keys
- Third-party service credentials

## Contributing

1. Follow existing code style and patterns
2. Use TypeScript for all new code
3. Test components thoroughly
4. Run linting before committing
5. Keep components modular and reusable

## Support

For issues or questions:
1. Check this documentation
2. Review component examples in the codebase
3. Check Next.js and React documentation
4. Use the development tools for debugging