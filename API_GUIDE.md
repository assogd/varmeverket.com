# Värmeverket API — Developer Quick Guide (Condensed)

A compact reference for front-end integration with the Värmeverket API.

---

## 1. Concepts

- User identifier: email address
- Spaces: physical rooms, grouped into areas (hierarchical)
- Bookings: connect user (email), space, start, end
- Permissions:
  - Unprivileged users: can manage their own data and bookings
  - Admin/privileged: can manage more domains
  - Exceeding permissions → 409 Unauthorized

Always include `credentials: "include"` for authenticated requests.  
Use `contentType: "application/json"` for JSON requests.

---

## 2. Authentication & Sessions

### 2.1 Request sign-in / registration (Magic link)

Endpoint:

    POST /session/sign-on?redirect={redirectUrl}
    Body: { "email": "user@example.com" }

Behaviour:

- Sends a magic link to the email
- `redirectUrl` is where the user lands after clicking the link (e.g. your front-end app URL)

Example (JS):

    const redirect = "https://www.varmeverket.com";
    const email = "user@example.com";

    fetch(`/session/sign-on?redirect=${redirect}`, {
      method: "POST",
      credentials: "include",
      headers: { contentType: "application/json" },
      body: JSON.stringify({ email })
    });

Typical response (success):

    {
      "message": "Check your inbox at user@example.com to confirm your email address or login.",
      "status_code": 200,
      "status_message": "OK"
    }

---

### 2.2 Check active session

Endpoint:

    GET /session

Behaviour:

- If logged in → returns `session` + `user`
- If not logged in / expired → 401 Unauthorized

Example (JS):

    const res = await fetch("/session", {
      method: "GET",
      credentials: "include",
      headers: { contentType: "application/json" }
    });

Session + user example (simplified):

    {
      "session": {
        "_fresh": true,
        "_id": "...",
        "csrf_token": "...",
        "lang": "sv"
      },
      "user": {
        "email": "user@example.com",
        "idx": 533,
        "name": "Firstname Lastname",
        "roles": ["member"],
        "username": "..."
      }
    }

Use this to:

- Render “logged in” vs “log in” UI
- Fetch current user profile

---

## 3. Users

Base URL:

    /v2/users

### 3.1 Get user

    GET /v2/users/:email

Returns user data for the specified email (if permitted).

### 3.2 Update user (partial)

    PATCH /v2/users/:email
    Body: { name?, password?, username?, email? }

Notes:

- Path `:email` should be the current identifier
- Body may include a new email if user is changing address

Example:

    const userEmail = "user@example.com";

    fetch(`/v2/users/${userEmail}`, {
      method: "PATCH",
      credentials: "include",
      headers: { contentType: "application/json" },
      body: JSON.stringify({
        name: "Firstname Lastname"
      })
    });

### 3.3 Replace user

    PUT /v2/users
    Body: { email, name, password, username? }

### 3.4 Delete user

    DELETE /v2/users/:email

Important:

- All bookings tied to this user must be deleted first.

---

## 4. Spaces

Base URL:

    /v2/spaces

### 4.1 List all spaces

    GET /v2/spaces

Example:

    fetch("/v2/spaces", {
      method: "GET",
      headers: { contentType: "application/json" }
    });

Typical response item:

    {
      "area": "musikverket" | null,
      "capacity": 8,
      "created_at": "Tue, 01 Oct 2024 10:08:16 GMT",
      "description": null,
      "m2": 15,
      "name": "Studio T",
      "slug": "studio-t",
      "status": 1
    }

Use this for:

- Dropdowns in booking forms
- Space overview pages

---

## 5. Bookings

There are two versions:

- `/v2/bookings` — user-centric (private, tied to logged-in user)
- `/v3/bookings` — calendar view (public, no personal data)

---

### 5.1 `/v2/bookings` — User’s own bookings

Base URL:

    /v2/bookings

#### 5.1.1 Get bookings for a user

    GET /v2/bookings?email={userEmail}

Example:

    const userEmail = "user@example.com";

    fetch(`/v2/bookings?email=${userEmail}`, {
      method: "GET",
      credentials: "include",
      headers: { contentType: "application/json" }
    });

Response example:

    [
      {
        "created": "Wed, 30 Oct 2024 10:43:33 GMT",
        "email": "user@example.com",
        "end": "Wed, 30 Oct 2024 11:15:00 GMT",
        "idx": 2131,
        "space": "studio t",
        "start": "Wed, 30 Oct 2024 11:00:00 GMT",
        "updated": "Wed, 30 Oct 2024 10:43:33 GMT"
      }
    ]

#### 5.1.2 Create booking

    POST /v2/bookings
    Body: { email, space, start, end }

Example:

    fetch("/v2/bookings", {
      method: "POST",
      credentials: "include",
      headers: { contentType: "application/json" },
      body: JSON.stringify({
        email: "user@example.com",
        space: "Studio Container 2",
        start: "2024-11-04 17:00",
        end: "2024-11-04 17:30"
      })
    });

#### 5.1.3 Delete booking

    DELETE /v2/bookings/:idx

Example:

    const bookingId = 2258;

    fetch(`/v2/bookings/${bookingId}`, {
      method: "DELETE",
      credentials: "include",
      headers: { contentType: "application/json" }
    });

---

### 5.2 `/v3/bookings` — Public calendar view (no user data)

Base URL:

    /v3/bookings

Behaviour:

- Returns bookings in 7-day batches
- Given a date like `2024-11-20`, returns all bookings for that week
- Does not expose user email or other personal information

#### 5.2.1 Calendar for a given space

    GET /v3/bookings?space={spaceSlugOrName}

Example:

    const space = "studio-o";

    fetch(`/v3/bookings?space=${space}`, {
      method: "GET",
      headers: { contentType: "application/json" }
    });

Response item example:

    {
      "end": "Mon, 11 Nov 2024 21:00:00 GMT",
      "idx": 2272,
      "space": "studio o",
      "start": "Mon, 11 Nov 2024 13:00:00 GMT"
    }

#### 5.2.2 Multi-space calendar

    GET /v3/bookings

Omitting the `space` parameter gives events for multiple spaces.  
Ideal for a resource calendar showing many rooms in parallel.

---

## 6. Logging out

Endpoint:

    GET /session/logout

Examples:

Front-end fetch:

    fetch("/session/logout", {
      method: "GET",
      credentials: "include",
      headers: { contentType: "application/json" }
    });

Simple HTML link:

    <a href="https://api.varmeverket.com/session/logout">Log out</a>

HTML form:

    <form action="https://api.varmeverket.com/session/logout">
      <button type="submit">Log out</button>
    </form>

Visiting this endpoint clears the current session.

---

## 7. Mailboxes (Sign-up Internals)

Mailboxes represent email addresses that may not yet have full user accounts (e.g. during sign-up).

Fields:

- `email`: email address
- `enabled`: datetime when email was validated
- `subscribed`: boolean, permission to send email

Flow summary:

1. User submits email
2. Mailbox entry is created / updated with token
3. Magic link is sent
4. User clicks link → token is validated
5. Session is created and (if needed) a user is created

---

## 8. Front-End Integration Checklist

- Use `credentials: "include"` for all authenticated calls
- Set `contentType: "application/json"` header for JSON requests
- Use:
  - `/session/sign-on` for login/registration via magic link
  - `/session` to detect logged-in state
  - `/v2/users` for current user profile UI
  - `/v2/spaces` to power booking UI (dropdowns, listings)
  - `/v2/bookings` for “My bookings” pages (private)
  - `/v3/bookings` for public calendars / availability
  - `/session/logout` to sign out
