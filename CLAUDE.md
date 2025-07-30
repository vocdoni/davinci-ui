# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Package Manager**: This project uses `pnpm` (required)

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Production preview
pnpm preview

# Linting (run after code changes)
pnpm lint
```

**Important**: Always run `pnpm lint` after making code changes to ensure code quality and catch TypeScript errors.

## Architecture Overview

DAVINCI UI is a React 18 + TypeScript Progressive Web App for decentralized voting built on the Vocdoni DAVINCI protocol.

### Core Technologies
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom implementations
- **State Management**: TanStack Query for server state, React Context for app state
- **Routing**: React Router with lazy loading
- **Web3**: Ethers.js + Reown AppKit for wallet connections
- **PWA**: Vite PWA plugin with service worker

### Key Architecture Patterns

**API Integration**: The app connects to Vocdoni's DAVINCI protocol via `@vocdoni/davinci-sdk`:
- `VocdoniApiProvider` (src/components/vocdoni-api-context.tsx) provides centralized API access
- Uses `VocdoniApiService` with configurable sequencer URL
- TanStack Query handles caching and data fetching

**Wallet Integration**:
- Reown AppKit handles wallet connections and Web3 interactions
- Supports both regular web and Farcaster MiniApp environments
- `MiniAppProvider` detects and configures Farcaster context

**Design System**:
- Custom Tailwind configuration with `davinci-*` color palette
- Radix UI components in `src/components/ui/`
- Two font families: Work Sans (primary) and Averia Libre (accent)
- CSS custom properties for theming in `src/styles/globals.css`

**Route Structure**:
- `/` - Home page
- `/vote/:id` - Individual vote page with process loader
- `/explore` - Vote discovery
- `/implement`, `/participate`, `/newsletter` - Static pages

### Environment Configuration

The app uses Vite's environment system with these key variables:
- `SEQUENCER_URL` - DAVINCI API endpoint (default: https://sequencer1.davinci.vote)
- `BIGQUERY_URL` - Analytics endpoint (default: https://c3.davinci.vote)
- `WALLETCONNECT_PROJECT_ID` - WalletConnect configuration
- `PUBLIC_MAILCHIMP_URL` - Newsletter integration
- `SHARE_TEXT` - Social sharing template

### Key Directories

- `src/pages/` - Main application routes
- `src/components/` - Reusable components and UI system
- `src/hooks/` - Custom React hooks for app logic
- `src/contexts/` - React context providers
- `src/lib/` - Utility libraries and configurations
- `src/utils/` - Helper functions

### Important Files

- `src/router.tsx` - Route configuration with loaders
- `src/main.tsx` - App initialization and provider setup
- `src/lib/appkit.ts` - Web3 wallet configuration
- `vite.config.ts` - Build configuration with PWA setup
- `tailwind.config.ts` - Design system configuration

### Development Notes

- No test framework is currently configured
- Uses path aliases configured in `tsconfig.paths.json` (import with `~` prefix)
  - Path aliases are defined using the `compilerOptions.paths` configuration in `tsconfig.json`
  - Allows importing modules using `~` prefix instead of relative paths
  - Helps maintain cleaner and more consistent import statements across the project
- PWA configuration includes offline support and app manifest
- All pages use lazy loading for optimal performance
- Error boundaries handle both route and component errors
