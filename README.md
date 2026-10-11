# Web Messages - Progressive Web App

A React-based Progressive Web App (PWA) providing a modern, responsive interface for anonymous and authenticated messaging. Features real-time message delivery, link-based conversation access, and works seamlessly across all devices.

## Overview

This frontend application provides a complete messaging experience with:

- Anonymous participation via shared conversation links
- Optional user authentication for creating conversations
- Real-time message updates via Socket.IO
- Image upload and display support
- Progressive Web App capabilities (installable, offline-capable)
- Responsive design for mobile and desktop
- Conversation management and settings

## Features

- **Zero Barrier Entry**: Join conversations via link without creating an account
- **Real-Time Messaging**: Instant message delivery using Socket.IO
- **User Authentication**: Optional login for conversation creators
- **Link Sharing**: Share conversation URLs for easy access
- **Anonymous Messaging**: Participate without authentication using display names
- **Image Support**: View and send image messages (when enabled)
- **Auto-Deletion Notice**: See when conversations will be deleted (30-day inactivity)
- **PWA Support**: Install as standalone app on mobile and desktop
- **Responsive Design**: Optimized for all screen sizes
- **Dark/Light Mode**: Adaptive UI themes (if implemented)

## Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript / JavaScript
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios / Fetch API
- **Routing**: React Router
- **Styling**:Styled Components
- **PWA**: Service Workers, Web App Manifest

## Prerequisites

- Node.js 24 or higher
- npm or yarn package manager
- Running backend service (API server)

## Environment Variables

Create a `.env` file in the root directory with these variables:

| Variable      | Description                                  | Default               | Required |
| ------------- | -------------------------------------------- | --------------------- | -------- |
| BACKEND_URL   | Backend service the dev/preview server proxies to | http://localhost:8000 | No       |
| VITE_APP_NAME | Application display name                     | Web Messages          | No       |

The client always talks to its own origin. The Vite dev and preview servers proxy `/auth`, `/push`, and `/socket.io` (including WebSockets) to `BACKEND_URL` (see `vite.config.ts`), so REST and Socket.IO share one URL and the backend needs no CORS. A production deployment behind a reverse proxy should route those same paths to the backend service.

**Note**: Only variables prefixed with `VITE_` are exposed to the client. `BACKEND_URL` is read by the Vite server at startup, not embedded in the bundle.

## Installation

Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode

Run with hot module replacement (HMR):

```bash
npm run dev
```

The application will start on `http://localhost:3000` (or next available port).

Changes to source files will be reflected immediately in the browser.

### Production Build

Build the optimized production bundle:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

This serves the built files from `dist/` directory.

### Development with Docker

Build the development Docker image:

```bash
docker build -f Dockerfile.dev -t messages-pwa-dev .
```

Run the development container:

```bash
docker run -p 3000:3000 \
    -e BACKEND_URL=http://host.docker.internal:8000 \
    -e VITE_APP_NAME="Web Messages" \
    messages-pwa-dev
```

### Production with Docker

Build the production Docker image:

```bash
docker build -t messages-pwa .
```

Run the production container:

```bash
docker run -p 3000:3000 \
    -e BACKEND_URL=http://host.docker.internal:8000 \
    -e VITE_APP_NAME="Web Messages" \
    messages-pwa
```

## Key Features Explained

### Anonymous Participation

Users can access any conversation via a shared link without creating an account:

1. Navigate to conversation URL (e.g., `/conversation/:convoId`)
2. Enter display name and select avatar
3. Start sending messages immediately

### User Authentication

Registered users can:

- Create new conversations
- Manage their conversations
- Access conversations across devices
- Reset passwords via email

### Real-Time Messaging

Socket.IO integration provides:

- Instant message delivery
- Typing indicators (if implemented)
- Online presence (if implemented)
- Automatic reconnection

### Progressive Web App

PWA features include:

- Install prompt for standalone app experience
- Offline message viewing (if service worker configured)
- App-like navigation and UI
- Push notifications via the Web Push API (`public/sw.js`). The bell in a conversation turns notifications on or off for that conversation on this device; tapping a notification opens its conversation. Requires the service's `VAPID_*` variables and HTTPS (or `localhost`). On iOS, the app must be added to the Home Screen first

## API Integration

The application connects to the backend service via:

**HTTP Requests** (REST API):

- User authentication (signup, login, refresh)
- Conversation metadata
- Message history pagination

**WebSocket** (Socket.IO):

- Real-time message delivery
- Live conversation updates
- Presence information

## Development Workflow

### Hot Module Replacement

Vite provides instant feedback during development:

- Edit React components → Browser updates automatically
- Edit CSS → Styles update without page reload
- TypeScript type checking in real-time

### Environment Variables

Use `.env.local` for local development overrides:

```bash
# .env.local
BACKEND_URL=http://localhost:8001
VITE_APP_NAME="My Chat App"
```

### Linting and Formatting

Run code quality checks:

```bash
# Lint code (if configured)
npm run lint

# Format code (if using Prettier)
npm run format
```

## Building for Production

### Optimization

Vite automatically optimizes production builds:

- Code splitting for faster initial load
- Tree shaking to remove unused code
- Asset compression and minification
- CSS optimization

### Build Output

After running `npm run build`, the `dist/` directory contains:

- `index.html` - Entry point
- `assets/` - Optimized JS, CSS, and images
- `manifest.json` - PWA manifest
- Service worker files (if configured)

### Deployment

Deploy the `dist/` directory to:

- Static hosting (Netlify, Vercel, GitHub Pages)
- CDN (Cloudflare Pages, AWS CloudFront)
- Web servers (nginx, Apache)
- Container platforms (Docker, Kubernetes)

#### Example: nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/messages-pwa/dist;
    index index.html;

    # Route all requests to index.html for SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Troubleshooting

### Backend Connection Errors

If the app can't connect to the backend:

1. Verify `BACKEND_URL` points at the backend (restart the dev server after changing it):

   ```bash
   echo $BACKEND_URL
   ```

2. Check backend is running:

   ```bash
   curl http://localhost:8000/health-check
   ```

3. Verify the request path is one the Vite proxy forwards (`/auth`, `/push`, `/socket.io`)

### Socket.IO Connection Issues

If real-time messaging doesn't work:

1. Check browser console for Socket.IO errors
2. Verify WebSocket connection in Network tab
3. Ensure backend Socket.IO is running
4. Check firewall/proxy WebSocket support

### Build Errors

If build fails:

1. Clear node_modules and reinstall:

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Vite cache:

   ```bash
   rm -rf node_modules/.vite
   ```

3. Check for TypeScript errors:
   ```bash
   npm run build 2>&1 | grep "error TS"
   ```

### Port Already in Use

Change the dev server port:

```bash
# In vite.config.ts
export default {
  server: {
    port: 3001
  }
}
```

Or use environment variable:

```bash
PORT=3001 npm run dev
```

### Environment Variables Not Working

Remember:

- Vite variables must start with `VITE_`
- Restart dev server after changing `.env`
- `VITE_` variables are embedded at build time
- Use `import.meta.env.VITE_APP_NAME` in code

## PWA Configuration

### Manifest

Edit `manifest.json` to customize:

- App name and description
- Icons and splash screens
- Theme colors
- Display mode (standalone, fullscreen)

### Service Worker

Configure caching strategies:

- API responses
- Static assets
- Offline fallback page

### Install Prompt

The app can prompt users to install:

- Appears after engagement criteria met
- Shows native install dialog
- Works on iOS, Android, desktop

## Security Considerations

- Never expose API keys or secrets in frontend code
- Validate and sanitize user input
- Use HTTPS in production
- Implement Content Security Policy (CSP)
- Keep dependencies updated
- Use environment variables for configuration

## Performance Optimization

- Lazy load routes with React.lazy()
- Optimize images (WebP format, proper sizing)
- Use React.memo() for expensive components
- Implement virtual scrolling for long message lists
- Debounce search and input handlers
- Monitor bundle size with Vite build analyzer

## Browser Support

Supports modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome Android 90+

For older browser support, configure Babel and add polyfills.

## Contributing

When contributing:

1. Follow existing code style
2. Write descriptive commit messages
3. Test on multiple devices/browsers
4. Update documentation for new features
5. Ensure builds pass before submitting

## License

Refer to the LICENSE file in the repository for licensing information.
