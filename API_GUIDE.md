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
Use `Content-Type: "application/json"` for JSON requests (header name is case-insensitive; standard is `Content-Type`).

---

## 2. Authentication & Sessions

### 2.1 Request sign-in / registration (Magic link)

Endpoint:

    POST /session/sign-on?redirect={redirectUrl}
    Body: { "email": "user@example.com" }

Behaviour:

- Sends a magic link to the email
- `redirectUrl` is where the user lands after clicking the link (e.g. your front-end app URL)
- **Important**: Only users with `enabled=1` can sign in. If a user is not enabled, the endpoint will return a special response indicating the address is not activated
- Previously open for both registrations and logins, but now only activated addresses (`enabled=1`) are processed

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

New user fields:

- `phone`: text
- `birthdate`: datetime
- `address_street`: text
- `address_code`: number
- `address_city`: text
- `profile`: JSON

### 3.1 Get user

    GET /v2/users/:email

Returns user data for the specified email (if permitted).

Example:

    curl -X GET "https://$credentialsuser@api.varmeverket.com/v2/users/benji@superstition.io"

Response:

    [
      {
        "email": "benji@superstition.io",
        "created": "Thu, 11 Jan 2024 12:48:46 GMT",
        "updated": "Thu, 22 Jan 2026 13:29:32 GMT",
        "idx": 308,
        "name": "Benji",
        "phone": null,
        "birthdate": null,
        "address_street": null,
        "address_code": null,
        "address_city": null,
        "profile": null
      }
    ]

### 3.2 Update user (partial)

    PATCH /v2/users/:email
    Body: { name?, password?, username?, email?, phone?, birthdate?, address_street?, address_code?, address_city?, profile? }

Notes:

- Path `:email` should be the current identifier (the logged-in user’s email)
- Body may include a new email if user is changing address
- If you get **403 "No permission"** with a valid session and path matching the current user, it is likely a backend permission/origin issue — contact the API maintainers

Use-case: Send a JSON payload with variable data (e.g. a profile object)

Example:

    curl -X PATCH "https://$credentialsuser@api.varmeverket.com/v2/users/benji@superstition.io" -d '{"profile": {"title": "developer", "organisation": "Värmeverket"}}'

Response:

    [
      {
        "email": "benji@superstition.io",
        "created": "Thu, 11 Jan 2024 12:48:46 GMT",
        "updated": "Thu, 22 Jan 2026 13:54:20 GMT",
        "idx": 308,
        "name": "Benji",
        "phone": null,
        "birthdate": null,
        "address_street": null,
        "address_code": null,
        "address_city": null,
        "profile": {
          "title": "developer",
          "organisation": "Värmeverket"
        }
      }
    ]

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

### 3.5 Aggregated user + bookings + form submissions

Base URL:

    /v3/users

    GET /v3/users/:email

Use this endpoint when you need to render user data combined with bookings or submissions. Aggregation happens directly in the DB and is faster than multiple calls.

Notes:

- Only upcoming or ongoing bookings are included
- All submissions are currently included (including archived)

Example:

    curl -X GET "https://$credentialsuser@api.varmeverket.com/v3/users/benji@superstition.io"

Response:

    [
      {
        "user_id": 308,
        "email": "benji@superstition.io",
        "created": "Thu, 11 Jan 2024 12:48:46 GMT",
        "updated": "Thu, 22 Jan 2026 13:54:20 GMT",
        "name": "Benji",
        "phone": null,
        "birthdate": null,
        "address_street": null,
        "address_code": null,
        "address_city": null,
        "profile": {
          "title": "developer",
          "organisation": "Värmeverket"
        },
        "bookings": [
          {
            "idx": 14407,
            "space": "studio container black",
            "start": "2026-01-22 15:15:00",
            "end": "2026-01-22 15:30:00",
            "email": "benji@superstition.io"
          },
          {
            "idx": 14407,
            "space": "studio container black",
            "start": "2026-01-22 15:15:00",
            "end": "2026-01-22 15:30:00",
            "email": "benji@superstition.io"
          }
        ],
        "form_submissions": [
          {
            "id": 1,
            "form": "/membership/application",
            "submission": {
              "email": "benji@superstition.io"
            }
          },
          {
            "id": 18,
            "form": "/membership/application",
            "submission": {
              "email": "benji@superstition.io",
              "Name": "Benji"
            }
          }
        ]
      }
    ]

Note: The curl examples here use HTTP Basic credentials for terminal testing. In web context, authentication is via session cookie, so ignore the `$credentialsuser@` prefix in the URL.

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

## 7. Form Submissions

Base URL:

    /v3/forms

### 7.1 Submit a form

Endpoint:

    POST /v3/forms/<form>

The `form` parameter can be either:

- A slug of the form
- The name of the form as created in Payload CMS

The important thing is that it's the main identifier for all submissions for a given form.

Example:

    curl -X POST "https://api.varmeverket.com/v3/forms/test-11" -d 'namn=Förnamn Efternamn'

Response:

    {
      "id": 661,
      "form": "test-11",
      "submission": {
        "namn": "Förnamn Efternamn"
      },
      "user_id": null,
      "created_at": "Wed, 10 Dec 2025 14:23:45 GMT",
      "archived": 0
    }

Notes:

- All submissions get `archived=0` by default
- New submissions automatically get `status="new"` if no status is specified
- By default, only non-archived submissions are returned in queries
- If a submission contains an `email` field, a `user_id` will be created or linked (not required for all forms)
- Email address is required for submissions related to membership applications
- In the future, approved and activated users will be able to list their own submissions

### 7.2 Get form submissions

Endpoint:

    GET /v3/forms/<form>

Example:

    curl -X GET "https://username:secret@api.varmeverket.com/v3/forms/test-11"

Response:

    [
      {
        "id": 683,
        "form": "test 10",
        "submission": {
          "email": "user@example.com"
        },
        "user_id": 10262,
        "created_at": "Wed, 28 Jan 2026 17:45:46 GMT",
        "archived": 0,
        "status_history": [
          {
            "id": 13,
            "submission_id": 683,
            "status": "new",
            "note": null,
            "created_at": "2026-01-28 17:45:46"
          }
        ]
      }
    ]

By default, only non-archived submissions are returned. To include archived submissions:

    GET /v3/forms/<form>?archived=1

### 7.3 Update a submission

Endpoint:

    PATCH /v3/forms/<submission_id>

#### 7.3.1 Archive a submission

Archive a submission when it's been handled and is no longer current. This is a separate step so that unapproved applications can be archived without activating a member.

Example:

    curl -X PATCH "https://username:secret@api.varmeverket.com/v3/forms/663" -d 'archived=1'

Response:

    {
      "id": 663,
      "form": "Test 11",
      "submission": {
        "name": "New Name"
      },
      "user_id": null,
      "created_at": "Wed, 10 Dec 2025 15:04:16 GMT",
      "archived": 1
    }

#### 7.3.2 Update submission status

Update the status of a submission to track its progress through a workflow.

**Critical behavior:** When `status=<value>` is included in the PATCH payload, **only** a new status history entry is created. No other changes will be applied—not archiving, not submission field updates, nothing else. The API separates status updates from other modifications to ensure clear, predictable behavior.

**Important:**

- To update status: send a PATCH request with **only** `status=<value>` in the payload
- To archive or update other submission data: send a PATCH request **without** `status` in the payload
- These operations must be done in separate requests—they cannot be combined

Example:

    curl -X PATCH "https://$credentials@api.varmeverket.com/v3/forms/684" -d 'status=pending interview'

Response:

    {
      "status_message": "Submission status updated"
    }

After updating status, a GET request will show the updated status history:

    curl -X GET "https://$credentials@api.varmeverket.com/v3/forms/test%2010/684"

Response:

    [
      {
        "id": 684,
        "form": "test 10",
        "submission": {
          "email": "user@example.com"
        },
        "user_id": 10262,
        "created_at": "Wed, 28 Jan 2026 18:11:22 GMT",
        "archived": 0,
        "status_history": [
          {
            "id": 15,
            "submission_id": 684,
            "status": "new",
            "note": null,
            "created_at": "2026-01-28 18:11:22"
          },
          {
            "id": 20,
            "submission_id": 684,
            "status": "pending interview",
            "note": null,
            "created_at": "2026-01-28 18:14:38"
          }
        ]
      }
    ]

### 7.4 Status History and Workflow

Form submissions now support status history tracking, allowing you to monitor the progress of submissions through various stages of processing. This is particularly useful for complex processes like membership applications that involve interviews, meet-and-greet sessions, and approval workflows.

#### Status Workflow Examples

Typical workflow paths:

- **Approval path:** `new` → `pending interview` → `pending introduction` → `accepted`
- **Rejection path:** `new` → `pending interview` → `denied`

#### Status History Details

- Each submission automatically gets `status="new"` when created (if no status is specified)
- Status changes are logged to a separate audit log (`status_history`)
- The `archived` field continues to work as before for filtering submissions before status history lookup
- Status history entries include:
  - `id`: unique identifier for the history entry
  - `submission_id`: reference to the submission
  - `status`: the status value
  - `note`: optional note (currently null)
  - `created_at`: timestamp when the status was set

---

## 8. User Activation

Base URL:

    /v2/email

### 8.1 Check user activation status

Endpoint:

    GET /v2/email/<email>

Example:

    curl -X GET "https://username:secret@api.varmeverket.com/v2/email/benji@superstition.io"

Response:

    [
      {
        "email": "benji@superstition.io",
        "user_idx": 308,
        "verified": "Wed, 03 Dec 2025 01:58:02 GMT",
        "subscribed": 0,
        "enabled": 0
      }
    ]

Notes:

- All new registrations are flagged as `enabled=0` by default
- Submissions containing an `email` field will be registered in the email table
- Users with `enabled=0` cannot sign in via `/session/sign-on`
- The `/session/sign-on` endpoint will return a special response when an email address is not activated (enabled=0)

### 8.2 Activate a user

Endpoint:

    PATCH /v2/email/<email>
    Body: { "enabled": 1 }

To approve a user and allow them to log in, set `enabled=1`:

Example:

    curl -X PATCH "https://$credentials@api.varmeverket.com/v2/email/benji@superstition.io" -d 'enabled=1'

Response:

    [
      {
        "email": "benji@superstition.io",
        "user_idx": 308,
        "verified": "Wed, 03 Dec 2025 01:58:02 GMT",
        "subscribed": 0,
        "enabled": 1
      }
    ]

After activation, you can sign the user in programmatically:

    curl -X POST "https://api.varmeverket.com/session/sign-on?redirect=https://<subdomain>.varmeverket.com" -d '{"email": "user@example.com"}'

---

## 9. API Key Authentication

For server-side operations (e.g., managing submissions and user activations), an API key is available that has permissions for queries and changes related to users.

**Note:** It would be possible to use session management to allow team members to manage submissions and activations, but this would require two-step logins when it comes to the `/admin` panel (one for `/admin` login, one for getting the user's session cookie for administrative requests). As an alternative, an API key was generated that is authorized to make queries and changes related to users. It is intended for use in server context only.

Authentication is done via HTTP Basic Auth:

Example credentials:

    {
      "username": "a66d164d-fb7b-57b4-a1c7-b63c0f79703b",
      "password": "pC1J2b8bryDVh8IlVMFfMcI-5_uz2VLLWqHI1hCAkoM"
    }

Alternative format:

    {
      "username": "a66d164d-fb7b-57b4-a1c7-b63c0f79703b",
      "http_basic_auth": {
        "username": "a66d164d-fb7b-57b4-a1c7-b63c0f79703b",
        "password": "pC1J2b8bryDVh8IlVMFfMcI-5_uz2VLLWqHI1hCAkoM"
      },
      "header": "Authorization: Basic YTY2ZDE2NGQtZmI3Yi01N2I0LWExYzctYjYzYzBmNzk3MDNiOnBDMUoyYjhicnlEVmg4SWxWTUZmTWNJLTVfdXoyVkxMV3FISTFoQ0Frb00="
    }

Using in curl:

    curl -X GET "https://username:password@api.varmeverket.com/v2/email/user@example.com"

Using as header:

    Authorization: Basic YTY2ZDE2NGQtZmI3Yi01N2I0LWExYzctYjYzYzBmNzk3MDNiOnBDMUoyYjhicnlEVmg4SWxWTUZmTWNJLTVfdXoyVkxMV3FISTFoQ0Frb00=

Note: This API key is intended for use in server context only.

---

## 10. Mailboxes (Sign-up Internals)

Mailboxes represent email addresses that may not yet have full user accounts (e.g. during sign-up).

Fields:

- `email`: email address
- `user_idx`: user ID if a user account exists
- `verified`: datetime when email was validated
- `subscribed`: boolean, permission to send email
- `enabled`: boolean (0 or 1), whether the user can sign in

Flow summary:

1. User submits form with email
2. Mailbox entry is created / updated with `enabled=0`
3. Magic link is sent (if applicable)
4. User clicks link → token is validated, `verified` is set
5. Admin activates user by setting `enabled=1`
6. User can now sign in via `/session/sign-on`

---

## 11. Front-End Integration Checklist

- Use `credentials: "include"` for all authenticated calls
- Set `Content-Type: "application/json"` header for JSON requests
- Use:
  - `/session/sign-on` for login/registration via magic link
  - `/session` to detect logged-in state
  - `/v2/users` for current user profile UI
  - `/v2/spaces` to power booking UI (dropdowns, listings)
  - `/v2/bookings` for “My bookings” pages (private)
  - `/v3/bookings` for public calendars / availability
  - `/session/logout` to sign out
