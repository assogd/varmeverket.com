# Värmeverket

## Overview

This repository contains the public-facing frontend for the Värmeverket platform — a digital ecosystem designed to support both public-facing communication and member-specific services connected to the building's infrastructure.

Development began in April 2025. This version (0.9.0) represents the public-facing interface, with the member portal planned for v1.0.0.

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

Create a `.env` file in the root directory with the following variables:

**Required:**

- `NEXT_PUBLIC_PAYLOAD_API_URL` - External Payload CMS API URL (e.g., `https://payload.cms.varmeverket.com/api`)

**Optional:**

- `PREVIEW_SECRET` - Secret token for preview mode (defaults to `your-preview-secret` - **change this in production!**)

**Email Configuration (for form submissions):**

- `SMTP_HOST` - SMTP server hostname (defaults to `smtp.resend.com` for Resend)
- `SMTP_PORT` - SMTP server port (defaults to `587`)
- `SMTP_USER` - SMTP username (defaults to `resend` for Resend)
- `SMTP_PASS` or `RESEND_API_KEY` - SMTP password/API key (required for sending emails)
- `SMTP_SECURE` - Use secure connection (set to `true` for port 465, defaults to `false`)
- `PAYLOAD_EMAIL_FROM` - Default sender email address (defaults to `noreply@varmeverket.com`)
- `PAYLOAD_EMAIL_FROM_NAME` - Default sender name (defaults to `Värmeverket`)

**Note:** This is a frontend-only repository that connects to an external Payload CMS backend. You don't need `PAYLOAD_SECRET` or `DATABASE_URI` unless you're running Payload CMS locally.

**Example `.env` file:**

```env
NEXT_PUBLIC_PAYLOAD_API_URL=https://payload.cms.varmeverket.com/api
PREVIEW_SECRET=your-preview-secret-here

# Email configuration (for form submissions)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
RESEND_API_KEY=re_your_api_key_here
PAYLOAD_EMAIL_FROM=noreply@varmeverket.com
PAYLOAD_EMAIL_FROM_NAME=Värmeverket
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
