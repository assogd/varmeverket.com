# Portal Admin Interface

## Overview

Build a separate admin interface for portal/user management at `/portal/admin/*`. This will be distinct from the Payload CMS admin (`/admin`) and focused on managing users, applications, form submissions, and bookings.

## Architecture

### Route Structure
- `/portal/admin` - Admin dashboard
- `/portal/admin/users` - User management (pending applications, user list)
- `/portal/admin/submissions` - Form submissions management
- `/portal/admin/bookings` - Bookings management
- `/portal/admin/settings` - Admin settings (optional)

### Authentication & Authorization
- Check if user has admin role (check `user.roles` array for "admin" or privileged role)
- Use existing session authentication
- Use API key authentication for backend operations (via Next.js API routes)
- Redirect non-admin users to dashboard

## Features

### 1. Admin Dashboard
- Stats overview:
  - Pending applications count (users with `enabled=0`)
  - Recent form submissions
  - Active bookings count
  - Recent activity
- Quick actions:
  - View pending applications
  - View recent submissions
  - View all bookings

### 2. User Management
- **Pending Applications**
  - List users with `enabled=0`
  - Show email, name, verification status, submission date
  - Actions: Activate, Reject (delete), View details
- **User List**
  - Search by email
  - Filter by enabled/disabled status
  - View user profile
  - Edit user data (if needed)
- **User Details**
  - Full profile information
  - Associated bookings
  - Form submissions linked to user
  - Activation history

### 3. Form Submissions Management
- **Submissions List**
  - View submissions by form (GET `/v3/forms/<form>`)
  - Filter by archived/unarchived
  - Search by email, form name
  - Show submission data, user link, created date
- **Submission Details**
  - View full submission data
  - Link to user (if email field exists)
  - Archive/unarchive submission (PATCH `/v3/forms/<submission_id>`)
  - Delete submission (if supported)
- **Form Selection**
  - Dropdown to select which form's submissions to view
  - Or list all submissions across forms

### 4. Bookings Management
- **All Bookings View**
  - List all bookings (may need new endpoint or aggregate from users)
  - Filter by user, space, date range
  - Sort by date, space, user
- **Create Booking**
  - Form to create booking for any user
  - Select user (search/autocomplete)
  - Select space
  - Date/time picker
- **Edit/Delete Bookings**
  - Edit booking details
  - Delete bookings
  - Bulk operations (if needed)

## Implementation Details

### 1. Admin Authentication & Authorization

**File**: `src/utils/adminAuth.ts`
- `isAdmin(user: User): boolean` - Check if user has admin role
- `requireAdmin(user: User | null): void` - Throw error if not admin
- Check `user.roles` array for "admin" or privileged roles

**File**: `src/components/auth/AdminRoute.tsx`
- Similar to `ProtectedRoute` but checks for admin role
- Redirects to dashboard if not admin
- Shows "Access Denied" message

### 2. Admin Service Layer

**File**: `src/services/adminService.ts`
- `getPendingApplications()` - Get users with `enabled=0`
- `activateUser(email: string)` - Activate user
- `getFormSubmissions(formSlug: string, archived?: boolean)` - Get submissions
- `archiveSubmission(submissionId: number)` - Archive submission
- `getAllBookings(filters?)` - Get all bookings (may need backend endpoint)
- `createBookingForUser(data)` - Create booking for any user
- All use API key authentication via Next.js API routes

### 3. Admin API Routes

**File**: `src/app/api/admin/users/route.ts`
- GET - Get pending applications, user list
- PATCH - Activate/reject users

**File**: `src/app/api/admin/submissions/route.ts`
- GET - Get form submissions
- PATCH - Archive/unarchive submissions

**File**: `src/app/api/admin/bookings/route.ts`
- GET - Get all bookings
- POST - Create booking for user
- DELETE - Delete booking

All routes use `getApiKeyCredentials()` pattern from existing `/api/admin/check-email`

### 4. Admin Components

**File**: `src/components/portal/admin/Dashboard.tsx`
- Stats cards
- Recent activity feed
- Quick action buttons

**File**: `src/components/portal/admin/UserList.tsx`
- Table/list of users
- Search and filters
- Action buttons (activate, view, etc.)

**File**: `src/components/portal/admin/PendingApplications.tsx`
- List of pending applications
- Activate/reject actions
- User details preview

**File**: `src/components/portal/admin/SubmissionsList.tsx`
- Table of form submissions
- Archive/unarchive actions
- Filter by form, archived status

**File**: `src/components/portal/admin/BookingsList.tsx`
- Table of all bookings
- Create/edit/delete actions
- Filters and search

**File**: `src/components/portal/admin/AdminLayout.tsx`
- Admin navigation sidebar
- Header with user info
- Consistent layout for admin pages

### 5. Admin Pages

**File**: `src/app/(frontend)/(portal)/admin/page.tsx`
- Dashboard with stats and quick actions

**File**: `src/app/(frontend)/(portal)/admin/users/page.tsx`
- User management page
- Tabs: Pending Applications, All Users

**File**: `src/app/(frontend)/(portal)/admin/submissions/page.tsx`
- Form submissions management
- Form selector, submissions table

**File**: `src/app/(frontend)/(portal)/admin/bookings/page.tsx`
- Bookings management
- Create, view, edit, delete bookings

### 6. Admin Navigation

**File**: `src/components/portal/admin/AdminNavigation.tsx`
- Sidebar navigation for admin
- Only visible to admin users
- Links: Dashboard, Users, Submissions, Bookings

## Data Flow

### User Activation Flow
```
Admin clicks "Activate" → AdminService.activateUser() → 
Next.js API route (/api/admin/users) → Backend API (PATCH /v2/email/:email) →
Update UI optimistically → Refresh user list
```

### Form Submission Archive Flow
```
Admin clicks "Archive" → AdminService.archiveSubmission() →
Next.js API route (/api/admin/submissions) → Backend API (PATCH /v3/forms/:id) →
Update UI optimistically → Refresh submissions list
```

### Booking Creation Flow
```
Admin fills form → AdminService.createBookingForUser() →
Next.js API route (/api/admin/bookings) → Backend API (POST /v2/bookings) →
Update UI optimistically → Refresh bookings list
```

## UI/UX Considerations

- **Dark Mode**: Match portal dark theme
- **Tables**: Use sortable, filterable tables for lists
- **Actions**: Clear action buttons with confirmations for destructive actions
- **Loading States**: Show loading indicators during operations
- **Error Handling**: Use consistent error messages via error handler
- **Success Feedback**: Toast notifications or inline success messages
- **Responsive**: Mobile-friendly admin interface

## Security Considerations

- All admin operations go through Next.js API routes (server-side)
- API key authentication required for backend operations
- Role-based access control (check admin role)
- Input validation on all forms
- Confirmation dialogs for destructive actions
- Rate limiting on API routes (optional)

## File Structure

```
src/
  app/(frontend)/(portal)/admin/
    page.tsx                    # Dashboard
    users/
      page.tsx                  # User management
    submissions/
      page.tsx                  # Form submissions
    bookings/
      page.tsx                  # Bookings management
  components/portal/admin/
    AdminLayout.tsx            # Admin layout wrapper
    AdminNavigation.tsx        # Admin sidebar nav
    Dashboard.tsx              # Dashboard component
    UserList.tsx               # User list component
    PendingApplications.tsx    # Pending apps component
    SubmissionsList.tsx        # Submissions list
    BookingsList.tsx           # Bookings list
    CreateBookingForm.tsx      # Create booking form
  services/
    adminService.ts            # Admin operations service
  utils/
    adminAuth.ts               # Admin auth utilities
  app/api/admin/
    users/
      route.ts                 # User management API
    submissions/
      route.ts                 # Submissions API
    bookings/
      route.ts                 # Bookings API
```

## Implementation Tasks

1. Create admin authentication utilities
2. Create AdminRoute component
3. Create admin service layer
4. Create admin API routes
5. Create admin layout and navigation
6. Build dashboard page with stats
7. Build user management page
8. Build form submissions page
9. Build bookings management page
10. Add error handling and loading states
11. Add optimistic updates
12. Test admin workflows

## Benefits

1. **Clear Separation**: Admin interface separate from member portal and CMS admin
2. **Focused Functionality**: Dedicated interface for user/portal management
3. **Better UX**: Optimized workflows for admin tasks
4. **Security**: Server-side API routes with proper authentication
5. **Maintainability**: Service layer makes it easy to extend
6. **Scalability**: Easy to add new admin features
