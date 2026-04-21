# Värmeverket

## Overview

This repository contains the frontend for the Värmeverket platform — a digital ecosystem designed to support both public-facing communication and member-specific services connected to the building's infrastructure.

Development began in April 2025. This version (`1.0.0`) includes both the public interface and the production member portal.

Backend API repository: [varmeverket-api](https://bitbucket.org/benjismithx/varmeverket-api/src/main/).

The current focus is on:

- A public information interface for residents and visitors
- A flexible architecture to support future member functionality
- Establishing clear design and code licensing practices to enable open collaboration and responsible reuse

## Setup

### Prerequisites

- Node.js 20+
- npm or yarn
- MongoDB database (or connection to external Payload CMS instance)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up local domain for development (see below)
4. Set up environment variables (see below)
5. Run the development server:
   ```bash
   npm run dev
   ```

### Local Development Domain Setup

**Important:** Authentication cookies are configured for `varmeverket.com` and subdomains. To test login functionality locally, you need to use a subdomain instead of `localhost`.

1. Add an entry to `/etc/hosts`:

   ```bash
   sudo nano /etc/hosts
   ```

   Add this line:

   ```
   127.0.0.1 local.addd.varmeverket.com
   ```

2. Access the application at:
   ```
   http://local.addd.varmeverket.com:3000
   ```

**Note:** Your browser may show a "Not Secure" warning because we're using HTTP instead of HTTPS for local development. This is normal and safe for local development only. The warning appears because the connection is not encrypted, but since you're only accessing your own local machine, this is acceptable.

This setup ensures that cookies set by the backend API (which are domain-restricted to `varmeverket.com` and subdomains) will be properly retained during local development.

### Environment Variables

Create a `.env` file in the root directory with the following variables.

**Required for production**

- `NEXT_PUBLIC_BACKEND_API_URL` or `BACKEND_API_URL` - Backend API base URL (for example `https://api.varmeverket.com`)
- `BACKEND_API_KEY_USERNAME` - Server-side API key username used by admin API routes
- `BACKEND_API_KEY_PASSWORD` - Server-side API key password used by admin API routes
- `PREVIEW_SECRET` - Required secret for preview mode URLs and preview endpoint access

**Required when running local Payload CMS**

- `PAYLOAD_SECRET`
- `DATABASE_URI`

**Commonly used / optional**

- `NEXT_PUBLIC_PAYLOAD_API_URL` - Payload API URL; dev defaults to `https://dev.varmeverket.com/api` when unset
- `PAYLOAD_API_URL` - Server-side Payload API base URL (used by admin payload-events proxy)
- `NEXT_PUBLIC_USE_EXTERNAL_BACKEND` - Toggle to force external Payload backend usage (`false` disables)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` or `RESEND_API_KEY`, `SMTP_SECURE`
- `PAYLOAD_EMAIL_FROM`, `PAYLOAD_EMAIL_FROM_NAME`
- `LOGIN_FLOW_DEBUG`, `NEXT_PUBLIC_API_DEBUG`, `NEXT_PUBLIC_SESSION_DEBUG`, `NEXT_PUBLIC_DASHBOARD_DEBUG`, `DASHBOARD_API_DEBUG`
- `NEXT_PUBLIC_CACHE_MONITOR`, `NEXT_PUBLIC_SKEDDA_BOOKING_URL`

**Example `.env` file**

```env
# Core runtime
NEXT_PUBLIC_BACKEND_API_URL=https://api.varmeverket.com
BACKEND_API_KEY_USERNAME=replace-with-admin-api-key-username
BACKEND_API_KEY_PASSWORD=replace-with-admin-api-key-password
PREVIEW_SECRET=replace-with-long-random-secret

# Payload (optional unless running local Payload)
# NEXT_PUBLIC_PAYLOAD_API_URL=https://dev.varmeverket.com/api
# NEXT_PUBLIC_PAYLOAD_API_URL=https://payload.cms.varmeverket.com/api
# PAYLOAD_API_URL=https://payload.cms.varmeverket.com/api
# PAYLOAD_SECRET=replace-if-running-local-payload
# DATABASE_URI=mongodb://127.0.0.1/payload

# Email configuration
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
RESEND_API_KEY=re_your_api_key_here
PAYLOAD_EMAIL_FROM=noreply@varmeverket.com
PAYLOAD_EMAIL_FROM_NAME=Värmeverket

# Optional diagnostics
# LOGIN_FLOW_DEBUG=false
# NEXT_PUBLIC_API_DEBUG=false
# NEXT_PUBLIC_SESSION_DEBUG=false
# NEXT_PUBLIC_DASHBOARD_DEBUG=false
# DASHBOARD_API_DEBUG=false
# NEXT_PUBLIC_CACHE_MONITOR=false

# Optional portal config
# NEXT_PUBLIC_SKEDDA_BOOKING_URL=https://example.skedda.com/booking
```

### Building for Production

```bash
npm run build
npm start
```

## License

This repository uses a **dual license**:

### Code — GNU AGPLv3

All code is licensed under the **GNU Affero General Public License v3.0**.

You can:

- Use, copy, and modify the code freely
- Contribute via pull requests
- Deploy publicly — _if you also publish your modified source code_

You may **not**:

- Use the software in a closed-source commercial product
- White-label the platform without releasing the source

[Full license text →](./LICENSE)

### Design Assets — CC BY-NC 4.0

All graphics, branding, design tokens, typography, and creative materials are licensed under **Creative Commons Attribution-NonCommercial 4.0**.

You may:

- Share, remix, and adapt
- Use in non-commercial projects

You may **not**:

- Sell or commercially reuse design assets
- White-label the identity or visuals

[Full license →](https://creativecommons.org/licenses/by-nc/4.0/)
