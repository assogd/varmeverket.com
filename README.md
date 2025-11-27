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

3. Set up environment variables (see below)
4. Run the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

**Required:**

- `NEXT_PUBLIC_PAYLOAD_API_URL` - External Payload CMS API URL (e.g., `https://payload.cms.varmeverket.com/api`)

**Optional:**

- `PREVIEW_SECRET` - Secret token for preview mode (defaults to `your-preview-secret` - **change this in production!**)

**Note:** This is a frontend-only repository that connects to an external Payload CMS backend. You don't need `PAYLOAD_SECRET` or `DATABASE_URI` unless you're running Payload CMS locally.

**Example `.env` file:**

```env
NEXT_PUBLIC_PAYLOAD_API_URL=https://payload.cms.varmeverket.com/api
PREVIEW_SECRET=your-preview-secret-here
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
