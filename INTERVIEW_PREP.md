# Technosys Interview Prep

## 1. Project Overview

Technosys is a full-stack MERN service-management platform for customers, technicians, and admins. The backend is an Express/Mongoose API in [Server/server.js](Server/server.js), and the frontend is a Vite React app in [Client/src/main.jsx](Client/src/main.jsx) and [Client/src/App.jsx](Client/src/App.jsx).

The project solves a real-world home-service workflow: customers can discover services, book appointments, chat with technicians, submit feedback or complaints, and receive payment/status updates; technicians can register, get approved, manage availability, accept jobs, track earnings, and purchase subscriptions; admins can approve technicians, manage services, manage complaints, and review analytics.

The main technologies actually used in the code are React 19, React Router, Axios, Socket.IO client, React Toastify, Recharts, Lucide icons, Tailwind CSS on the frontend, and Express, Mongoose, JWT, bcryptjs, Passport Google OAuth, Nodemailer, Multer, Socket.IO, Razorpay, node-cron, and MongoDB on the backend. See [Client/package.json](Client/package.json) and [Server/package.json](Server/package.json).

## 2. Complete Architecture

The app is split into three layers:

1. Frontend UI layer in [Client/src/App.jsx](Client/src/App.jsx), [Client/src/context/AppContext.jsx](Client/src/context/AppContext.jsx), and the page/component folders under [Client/src/pages](Client/src/pages) and [Client/src/components](Client/src/components).
2. API layer in [Server/server.js](Server/server.js) plus routes in [Server/routes](Server/routes) and controllers in [Server/controllers](Server/controllers).
3. Data and integration layer in [Server/models](Server/models), [Server/config](Server/config), [Server/services](Server/services), and [Server/middleware](Server/middleware).

The server initializes MongoDB in [Server/config/mongodb.js](Server/config/mongodb.js), sets security middleware, serves uploads from /uploads, initializes Socket.IO in [Server/config/realtime.js](Server/config/realtime.js), sets up Passport Google OAuth in [Server/config/passport.js](Server/config/passport.js), and starts booking auto-cancellation scheduling from [Server/controllers/booking.controller.js](Server/controllers/booking.controller.js).

The frontend boots in [Client/src/main.jsx](Client/src/main.jsx), wraps the app with [AppContextProvider](Client/src/context/AppContext.jsx) and [BrowserRouter](Client/src/main.jsx), and uses route guarding in [ProtectedRoute](Client/src/App.jsx) and auth redirects in [AuthRedirectHandler](Client/src/App.jsx).

## 3. System Workflow

### User registration

Technician registration is implemented in [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js), `register`. It requires uploaded `idProof` and `photo`, validates required fields, verifies mobile/email OTPs via [Server/models/TempOtpVerification.js](Server/models/TempOtpVerification.js), hashes the password with bcrypt, stores the technician in [Server/models/Technician.js](Server/models/Technician.js), stores bank details in [Server/models/TechnicianBankDetails.js](Server/models/TechnicianBankDetails.js), and stores the technician-to-category mapping in [Server/models/TechnicianServiceCategory.js](Server/models/TechnicianServiceCategory.js).

Customer registration is implicit in the mobile OTP login flow. [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js), `verifyCustomerMobileOtp`, creates a [Server/models/Customer.js](Server/models/Customer.js) record automatically if the customer does not already exist.

### Login

Technician/admin login is handled by [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js), `login`. It checks [Server/models/LoginBlock.js](Server/models/LoginBlock.js) for brute-force protection, optionally requires reCAPTCHA, compares passwords with bcrypt, and issues a JWT cookie named `token`.

Customer login is handled by [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js), `sendCustomerMobileOtp` and `verifyCustomerMobileOtp`. The client UI for this flow is [Client/src/pages/LoginCustomer.jsx](Client/src/pages/LoginCustomer.jsx).

### Authentication

Authenticated state is checked by [Server/middleware/userAuth.js](Server/middleware/userAuth.js), which verifies the JWT from cookies or bearer header, looks up the user by `decoded.type`, and sets `req.userId`, `req.userType`, and related identity fields.

The frontend initializes auth state in [Client/src/context/AppContext.jsx](Client/src/context/AppContext.jsx) through `getAuthState` and `getUserData`, and redirects based on role in [Client/src/App.jsx](Client/src/App.jsx).

### Technician registration

Technician signup is driven by [Client/src/pages/Login.jsx](Client/src/pages/Login.jsx), which contains validation, OTP state, file inputs, map picker integration, and form submission logic. The backend side is `register` in [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js).

### Admin approval

Admin technician approval is implemented in [Server/controllers/admin.controller.js](Server/controllers/admin.controller.js), `approveTechnician` and `rejectTechnician`. Approval sets `VerifyStatus` to `Approved`, rejection sets `VerifyStatus` to `Rejected` and `ActiveStatus` to `Deactive`, and both send email notifications. The frontend admin queue is [Client/src/pages/AdminTechnicianRequest.jsx](Client/src/pages/AdminTechnicianRequest.jsx) and the admin list view is [Client/src/pages/AdminTechnicianList.jsx](Client/src/pages/AdminTechnicianList.jsx).

### Service booking

Booking starts in [Client/src/pages/CustomerServiceDetails.jsx](Client/src/pages/CustomerServiceDetails.jsx). The customer chooses a service, runs `precheck`, and then either creates a booking directly or creates an authorization-first payment order. On the backend, `precheckAvailability` and `createBooking` are in [Server/controllers/booking.controller.js](Server/controllers/booking.controller.js).

`precheckAvailability` checks the customer location, infers the parent service category from the sub-service, and finds eligible technicians. `createBooking` validates customer address and email, prevents duplicate active bookings for the same slot, creates a [Server/models/Booking.js](Server/models/Booking.js) document, optionally links a payment record, and creates a [Server/models/ServiceRequest.js](Server/models/ServiceRequest.js) record.

### Booking acceptance/rejection

Technician acceptance is implemented in [Server/controllers/booking.controller.js](Server/controllers/booking.controller.js), `acceptBooking`. It checks the technician wallet in [Server/models/TechnicianWallet.js](Server/models/TechnicianWallet.js), deducts coins required by the selected sub-service, updates booking status to `Confirmed`, sets an arrival deadline, marks the technician’s slot as booked in [Server/models/TechnicianAvailability.js](Server/models/TechnicianAvailability.js), creates chat, and emits socket events.

Booking rejection is represented by booking status handling in [Server/models/Booking.js](Server/models/Booking.js) and the related cancellation logic in [Server/controllers/booking.controller.js](Server/controllers/booking.controller.js).

### Booking completion

Technician arrival and completion are OTP-based. `generateArrivalOTP` and `verifyArrivalOTP` in [Server/controllers/booking.controller.js](Server/controllers/booking.controller.js) generate and verify a 6-digit arrival OTP using [Server/models/BookingArrivalOTP.js](Server/models/BookingArrivalOTP.js). `completeService` changes the booking to `Completed`, creates an [Server/models/AdminPayout.js](Server/models/AdminPayout.js) record, generates an invoice, and emails the technician.

### Feedback

Customer feedback is implemented in [Server/controllers/feedback.controller.js](Server/controllers/feedback.controller.js), `submitFeedback`, `getFeedback`, and `getCustomerFeedbacks`. Feedback is stored in [Server/models/Feedback.js](Server/models/Feedback.js) and only works for completed bookings owned by the customer.

### Subscription

Subscription packages are managed in [Server/controllers/subscriptionPackage.controller.js](Server/controllers/subscriptionPackage.controller.js). Technicians can purchase packages, get history, create Razorpay orders, and verify payment. The relevant collections are [Server/models/SubscriptionPackage.js](Server/models/SubscriptionPackage.js), [Server/models/SubscriptionHistory.js](Server/models/SubscriptionHistory.js), [Server/models/SubscriptionPayment.js](Server/models/SubscriptionPayment.js), [Server/models/TechnicianWallet.js](Server/models/TechnicianWallet.js), and [Server/models/Invoice.js](Server/models/Invoice.js).

### Payment

Payment is implemented. For bookings, [Server/controllers/bookingPayment.controller.js](Server/controllers/bookingPayment.controller.js), `createPaymentOrder` and `verifyPaymentAuthorization`, create a Razorpay authorization flow and update [Server/models/CustomerPayment.js](Server/models/CustomerPayment.js). For subscriptions, [Server/controllers/subscriptionPackage.controller.js](Server/controllers/subscriptionPackage.controller.js), `createRazorpayOrder` and `verifyRazorpayPayment`, handle order creation and finalization.

### Notifications

Notifications are implemented through emails, Socket.IO, and browser notifications. Email delivery uses [Server/config/nodemailer.js](Server/config/nodemailer.js) and inline mail senders in auth, booking, complaint, and subscription controllers. Realtime delivery uses [Server/config/realtime.js](Server/config/realtime.js). The client shows browser notifications in booking/chat-related pages such as [Client/src/pages/CustomerBookings.jsx](Client/src/pages/CustomerBookings.jsx), [Client/src/pages/TechnicianDashboard.jsx](Client/src/pages/TechnicianDashboard.jsx), and [Client/src/pages/ChatPage.jsx](Client/src/pages/ChatPage.jsx).

## 4. Authentication

JWT implementation is in [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js), `signAuthToken`, `login`, `googleLogin`, and `verifyCustomerMobileOtp`, and is verified in [Server/middleware/userAuth.js](Server/middleware/userAuth.js).

Password hashing uses bcrypt in [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js), `register`, `login`, `resetPassword`, and [Server/controllers/adminRegister.controller.js](Server/controllers/adminRegister.controller.js), `createAdmin`. Technician password changes also hash new passwords in [Server/controllers/technicianProfile.controller.js](Server/controllers/technicianProfile.controller.js), `changeTechnicianPassword`.

Protected routes are enforced through [Server/middleware/userAuth.js](Server/middleware/userAuth.js) and route-level role checks in [Server/routes/admin.route.js](Server/routes/admin.route.js), [Server/routes/analytics.route.js](Server/routes/analytics.route.js), [Server/routes/subscriptionPackage.route.js](Server/routes/subscriptionPackage.route.js), and [Server/routes/feedback.route.js](Server/routes/feedback.route.js).

Role-based access is implemented with `req.userType` in [Server/middleware/userAuth.js](Server/middleware/userAuth.js). It explicitly recognizes `admin`, `technician`, `customer`, and `google` tokens.

Token verification occurs in [Server/middleware/userAuth.js](Server/middleware/userAuth.js) via `jwt.verify`. Cookies are set in [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js) and cleared by `logout` and `logoutCustomer` in the same file.

## 5. Database Design

### Admin

[Server/models/Admin.js](Server/models/Admin.js) stores `username` and `password`. It is used for admin login and admin creation.

### Customer

[Server/models/Customer.js](Server/models/Customer.js) stores `Name`, `Mobile`, `Email`, `Address`, and `location`. It has a geospatial index on `location` using `2dsphere`.

### Technician

[Server/models/Technician.js](Server/models/Technician.js) stores profile, credentials, address, geolocation, file paths, OTP fields, verification state, and active status. It also has a `2dsphere` index on `location`.

### ServiceCategory

[Server/models/ServiceCategory.js](Server/models/ServiceCategory.js) stores top-level service categories with `name`, `isActive`, and `image`.

### SubServiceCategory

[Server/models/SubServiceCategory.js](Server/models/SubServiceCategory.js) stores `name`, `serviceCategoryId`, `description`, `price`, `coinsRequired`, `isActive`, and `image`. It references [Server/models/ServiceCategory.js](Server/models/ServiceCategory.js).

### TechnicianAvailability

[Server/models/TechnicianAvailability.js](Server/models/TechnicianAvailability.js) stores a technician’s `date` and an array of `timeSlots`. It has a unique compound index on `technicianId` and `date`.

### ServiceRequest

[Server/models/ServiceRequest.js](Server/models/ServiceRequest.js) stores `BookingID`, notes, estimated duration, materials, priority, and the broadcast technician list.

### Booking

[Server/models/Booking.js](Server/models/Booking.js) stores the booking lifecycle: customer, technician, sub-service, date, time slot, status, acceptance time, auto-cancel time, payment reference, arrival deadline, arrival verification, and timestamps.

### BookingArrivalOTP

[Server/models/BookingArrivalOTP.js](Server/models/BookingArrivalOTP.js) stores OTPs for arrival/completion verification and indexes by booking, purpose, and usage state.

### TempOtpVerification

[Server/models/TempOtpVerification.js](Server/models/TempOtpVerification.js) stores temporary mobile/email OTPs used for verification and registration.

### LoginBlock

[Server/models/LoginBlock.js](Server/models/LoginBlock.js) stores login attempt counts and block expiration per email address.

### CustomerPayment

[Server/models/CustomerPayment.js](Server/models/CustomerPayment.js) stores booking payment state, Razorpay IDs, and authorization/capture/refund status.

### SubscriptionPackage

[Server/models/SubscriptionPackage.js](Server/models/SubscriptionPackage.js) stores coin packages, pricing, description, and active status. It has an index on `isActive` and `price`.

### SubscriptionHistory

[Server/models/SubscriptionHistory.js](Server/models/SubscriptionHistory.js) stores technician package purchase history.

### SubscriptionPayment

[Server/models/SubscriptionPayment.js](Server/models/SubscriptionPayment.js) stores payment state for subscription checkout and provider IDs.

### TechnicianWallet

[Server/models/TechnicianWallet.js](Server/models/TechnicianWallet.js) stores technician coin balance and last update time.

### CoinUsage

[Server/models/CoinUsage.js](Server/models/CoinUsage.js) records how many coins were used for a booking.

### Complaint

[Server/models/Complaint.js](Server/models/Complaint.js) stores complaints attached to bookings.

### ComplaintThresholds

[Server/models/ComplaintThresholds.js](Server/models/ComplaintThresholds.js) stores warning, temporary deactivation, and permanent deactivation thresholds.

### TechnicianComplaintStatus

[Server/models/TechnicianComplaintStatus.js](Server/models/TechnicianComplaintStatus.js) stores complaint count, deactivation reason, and temporary expiry for each technician.

### Feedback

[Server/models/Feedback.js](Server/models/Feedback.js) stores booking rating and feedback text.

### Chat

[Server/models/Chat.js](Server/models/Chat.js) stores one chat per booking, unread counts, active/archive state, and expiration. It has indexes for customer and technician lookups and a virtual `isReadOnly`.

### Message

[Server/models/Message.js](Server/models/Message.js) stores individual chat messages, attachments, delivery/read timestamps, and soft delete flags. It also defines unread-count helpers and read-marking helpers.

### Refund

[Server/models/Refund.js](Server/models/Refund.js) stores refunds for booking cancellations and links them to bookings, customers, and payments.

### AdminPayout

[Server/models/AdminPayout.js](Server/models/AdminPayout.js) stores payouts due to technicians when a service is completed.

### Invoice

[Server/models/Invoice.js](Server/models/Invoice.js) stores a polymorphic invoice PDF reference using `ref_type` and `ref_id`.

### FailedPaymentOperation

[Server/models/FailedPaymentOperation.js](Server/models/FailedPaymentOperation.js) stores retry information for failed payment, invoice, or email steps. It has an index on `status` and `retryCount`.

### UserGoogle

[Server/models/userGoogleModel.js](Server/models/userGoogleModel.js) stores Google OAuth identities.

### User

[Server/models/userModels.js](Server/models/userModels.js) stores the legacy user model with verification and password reset OTP fields.

## 6. Backend Folder Structure

The backend structure is organized into:

- [Server/controllers](Server/controllers) for business logic.
- [Server/routes](Server/routes) for HTTP endpoints.
- [Server/models](Server/models) for MongoDB schemas.
- [Server/middleware](Server/middleware) for auth and request control.
- [Server/config](Server/config) for database, Passport, realtime, and mail setup.
- [Server/services](Server/services) for payment and invoice helpers.
- [Server/utils](Server/utils) for upload and image helpers.

### Controller summary

- [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js): technician registration, login, logout, OTP verification, reset password, customer OTP login, and cleanup.
- [Server/controllers/user.controller.js](Server/controllers/user.controller.js): authenticated user profile data and technician wallet access.
- [Server/controllers/admin.controller.js](Server/controllers/admin.controller.js): technician list, approval, rejection, stats, and status toggle.
- [Server/controllers/AdminCustomerList.controller.js](Server/controllers/AdminCustomerList.controller.js): customer listing and completeness flags.
- [Server/controllers/adminRegister.controller.js](Server/controllers/adminRegister.controller.js): one-time admin creation.
- [Server/controllers/serviceCategory.controller.js](Server/controllers/serviceCategory.controller.js): category CRUD and active-list queries.
- [Server/controllers/subServiceCategory.controller.js](Server/controllers/subServiceCategory.controller.js): subcategory CRUD.
- [Server/controllers/technicianProfile.controller.js](Server/controllers/technicianProfile.controller.js): technician profile, email/mobile verification, and password change.
- [Server/controllers/technicianAvailability.controller.js](Server/controllers/technicianAvailability.controller.js): availability upsert and retrieval.
- [Server/controllers/booking.controller.js](Server/controllers/booking.controller.js): booking lifecycle, acceptance, OTPs, completion, auto-cancel, and chat creation.
- [Server/controllers/bookingPayment.controller.js](Server/controllers/bookingPayment.controller.js): booking payment authorization and verification.
- [Server/controllers/feedback.controller.js](Server/controllers/feedback.controller.js): feedback submit/read endpoints.
- [Server/controllers/complaint.controller.js](Server/controllers/complaint.controller.js): complaint submit/read endpoints and threshold actions.
- [Server/controllers/subscriptionPackage.controller.js](Server/controllers/subscriptionPackage.controller.js): package CRUD, purchase, payment, history, and invoice attachment.
- [Server/controllers/analytics.controller.js](Server/controllers/analytics.controller.js): admin analytics dashboards.
- [Server/controllers/technicianAnalytics.controller.js](Server/controllers/technicianAnalytics.controller.js): technician analytics dashboards.
- [Server/controllers/thresholds.controller.js](Server/controllers/thresholds.controller.js): complaint threshold retrieval and updates.
- [Server/controllers/chat.controller.js](Server/controllers/chat.controller.js): chat creation, message history, sending, read receipts, and chat listing.

## 7. Frontend Folder Structure

The frontend is organized into:

- [Client/src/App.jsx](Client/src/App.jsx) for routing and protected routes.
- [Client/src/context](Client/src/context) for shared app state.
- [Client/src/components](Client/src/components) for layouts, navbars, chat, modals, loaders, and shared UI.
- [Client/src/pages](Client/src/pages) for role-specific screens.
- [Client/src/assets](Client/src/assets) for images and static assets.

### State management and context

[Client/src/context/AppContext.jsx](Client/src/context/AppContext.jsx), `AppContextProvider`, keeps global auth state, user data, backend URL, and Socket.IO connection state. It calls `/api/auth/is-auth` and `/api/user/data` to restore the current session, and exposes `realtimeSubscribe` and `realtimeUnsubscribe` for model-change listeners.

### Routing

Routing is defined in [Client/src/App.jsx](Client/src/App.jsx). Public routes are `/`, `/login`, `/login-customer`, `/email-verify`, and `/reset-password`. Protected nested routes exist under `/admin`, `/technician`, and `/customer`.

### Protected routes

`ProtectedRoute` in [Client/src/App.jsx](Client/src/App.jsx) blocks access until auth state is known and redirects users to the correct dashboard based on `userData.role`.

### API integration and Axios usage

Axios is configured with `withCredentials` in [Client/src/context/AppContext.jsx](Client/src/context/AppContext.jsx), and many pages call backend endpoints directly using Axios or fetch. The app uses cookies for JWT authentication rather than storing access tokens in localStorage.

## 8. Major Frontend Modules

### Public module

[Client/src/pages/Home.jsx](Client/src/pages/Home.jsx) renders the public home experience, [Client/src/components/Navbar.jsx](Client/src/components/Navbar.jsx) handles top-level navigation, and [Client/src/components/Header.jsx](Client/src/components/Header.jsx) renders the hero section.

### Admin module

[Client/src/components/AdminLayout.jsx](Client/src/components/AdminLayout.jsx) provides the shell. [Client/src/components/AdminNavbar.jsx](Client/src/components/AdminNavbar.jsx) supplies the admin menu. The main screens are [Client/src/pages/Admin.jsx](Client/src/pages/Admin.jsx), [Client/src/pages/AdminTechnicianRequest.jsx](Client/src/pages/AdminTechnicianRequest.jsx), [Client/src/pages/AdminTechnicianList.jsx](Client/src/pages/AdminTechnicianList.jsx), [Client/src/pages/TechnicianDetails.jsx](Client/src/pages/TechnicianDetails.jsx), [Client/src/pages/AdminCustomerList.jsx](Client/src/pages/AdminCustomerList.jsx), [Client/src/pages/AdminCategories.jsx](Client/src/pages/AdminCategories.jsx), [Client/src/pages/AdminSubscriptions.jsx](Client/src/pages/AdminSubscriptions.jsx), [Client/src/pages/AdminFeedbacks.jsx](Client/src/pages/AdminFeedbacks.jsx), [Client/src/pages/AdminTechnicianCompliant.jsx](Client/src/pages/AdminTechnicianCompliant.jsx), and [Client/src/pages/AdminSettings.jsx](Client/src/pages/AdminSettings.jsx).

### Technician module

[Client/src/components/TechnicianLayout.jsx](Client/src/components/TechnicianLayout.jsx) and [Client/src/components/TechnicianNavbar.jsx](Client/src/components/TechnicianNavbar.jsx) wrap the technician UI. The main screens are [Client/src/pages/TechnicianDashboard.jsx](Client/src/pages/TechnicianDashboard.jsx), [Client/src/pages/TechnicianAvailability.jsx](Client/src/pages/TechnicianAvailability.jsx), [Client/src/pages/TechnicianBookings.jsx](Client/src/pages/TechnicianBookings.jsx), [Client/src/pages/TechnicianSubscription.jsx](Client/src/pages/TechnicianSubscription.jsx), [Client/src/pages/TechnicianFeedbacks.jsx](Client/src/pages/TechnicianFeedbacks.jsx), [Client/src/pages/TechnicianProfile.jsx](Client/src/pages/TechnicianProfile.jsx), and [Client/src/pages/TechnicianAnalysis.jsx](Client/src/pages/TechnicianAnalysis.jsx).

### Customer module

[Client/src/components/CustomerLayout.jsx](Client/src/components/CustomerLayout.jsx) and [Client/src/components/CustomerNavbar.jsx](Client/src/components/CustomerNavbar.jsx) wrap the customer UI. The main screens are [Client/src/pages/CustomerDashboard.jsx](Client/src/pages/CustomerDashboard.jsx), [Client/src/pages/CustomerServiceDetails.jsx](Client/src/pages/CustomerServiceDetails.jsx), [Client/src/pages/CustomerBookings.jsx](Client/src/pages/CustomerBookings.jsx), [Client/src/pages/CustomerProfile.jsx](Client/src/pages/CustomerProfile.jsx), [Client/src/pages/CustomerSettings.jsx](Client/src/pages/CustomerSettings.jsx), and the chat wrapper in [Client/src/pages/ChatPage.jsx](Client/src/pages/ChatPage.jsx).

### Shared components

[Client/src/components/ServiceOrbitLoader.jsx](Client/src/components/ServiceOrbitLoader.jsx), [Client/src/components/BookingTracker.jsx](Client/src/components/BookingTracker.jsx), [Client/src/components/ArrivalOTPModal.jsx](Client/src/components/ArrivalOTPModal.jsx), [Client/src/components/FeedbackModal.jsx](Client/src/components/FeedbackModal.jsx), [Client/src/components/ComplaintModal.jsx](Client/src/components/ComplaintModal.jsx), [Client/src/components/ChatWindow.jsx](Client/src/components/ChatWindow.jsx), [Client/src/components/MessageInput.jsx](Client/src/components/MessageInput.jsx), and [Client/src/components/MapPicker.jsx](Client/src/components/MapPicker.jsx) provide shared interactions.

## 9. Complete API List

### Auth

| Method | Endpoint | Purpose | Auth? | Request Body | Response |
|---|---|---|---|---|---|
| POST | /api/auth/register | Technician registration | No | form-data with technician data, `idProof`, `photo` | success, technician data or validation error |
| POST | /api/auth/login | Technician/admin login | No | email, password, optional recaptchaToken | JWT cookie, user data, role |
| POST | /api/auth/logout | Logout technician/admin | No | none | success |
| GET | /api/auth/is-auth | Check current auth state | Yes | none | logged-in state, user type, user email |
| POST | /api/auth/send-mobile-otp | Send OTP for mobile | No | mobile | success, OTP in dev |
| POST | /api/auth/verify-mobile-otp | Verify mobile OTP | No | mobile, otp | success |
| POST | /api/auth/send-email-otp | Send OTP for email | No | email | success, OTP in dev |
| POST | /api/auth/verify-email-otp | Verify email OTP | No | email, otp | success |
| POST | /api/auth/send-reset-otp | Send password reset OTP | No | email | success |
| POST | /api/auth/reset-password | Reset technician password | No | email, otp, newPassword | success |
| POST | /api/auth/customer/send-mobile-otp | Send customer login OTP | No | mobile | success, OTP in dev |
| POST | /api/auth/customer/verify-mobile-otp | Verify customer OTP and login | No | mobile, otp | JWT cookie, customer data |
| POST | /api/auth/customer/logout | Logout customer | No | none | success |
| GET | /api/auth/google | Start Google OAuth | No | none | redirects to Google |
| GET | /api/auth/google/callback | Google OAuth callback | No | handled by Passport | JWT cookie, redirect |

### User

| Method | Endpoint | Purpose | Auth? | Request Body | Response |
|---|---|---|---|---|---|
| GET | /api/user/data | Fetch current user profile | Yes | none | role-specific user data |
| GET | /api/user/wallet | Fetch technician wallet | Yes, technician only | none | coin balance |

### Admin

| Method | Endpoint | Purpose | Auth? | Request Body | Response |
|---|---|---|---|---|---|
| GET | /api/admin/technicians | List technicians | Yes, admin | optional status | technician list |
| GET | /api/admin/technicians/stats | Technician stats | Yes, admin | none | pending, approved, rejected, total |
| GET | /api/admin/technicians/:id | Technician detail | Yes, admin | none | technician details |
| PATCH | /api/admin/technicians/:id/approve | Approve technician | Yes, admin | none | approved technician |
| PATCH | /api/admin/technicians/:id/reject | Reject technician | Yes, admin | reason | rejected technician |
| GET | /api/admin/dashboard | Admin dashboard message | Yes, admin | none | welcome message |
| GET | /api/admin/test | Admin API health/test | Yes, admin | none | success |
| POST | /api/admin-setup/create | Create initial admin | No, secret-gated | username, password, secret | created admin |
| GET | /api/admin/customers | Paginated customers | Yes, admin | page, pageSize, q | customers list |
| GET | /api/admin/customers/raw | Raw customer list | Yes, admin | none | customers list |

### Categories

| Method | Endpoint | Purpose | Auth? | Request Body | Response |
|---|---|---|---|---|---|
| GET | /api/service-categories | List categories | No | none | category list |
| GET | /api/service-categories/active | List active categories | No | none | active category list |
| POST | /api/service-categories | Create category | Yes, admin | name, isActive, image | created category |
| PUT | /api/service-categories/:id | Update category | Yes, admin | name, isActive, image | updated category |
| DELETE | /api/service-categories/:id | Soft deactivate category | Yes, admin | none | deactivated category |
| GET | /api/sub-service-categories | List subcategories | No | optional serviceCategoryId | subcategory list |
| GET | /api/sub-service-categories/:id | Get subcategory | No | none | single subcategory |
| POST | /api/sub-service-categories | Create subcategory | Yes, admin | name, serviceCategoryId, description, price, coinsRequired, image | created subcategory |
| PUT | /api/sub-service-categories/:id | Update subcategory | Yes, admin | same as above | updated subcategory |
| DELETE | /api/sub-service-categories/:id | Soft deactivate subcategory | Yes, admin | none | deactivated subcategory |

### Technician profile and availability

| Method | Endpoint | Purpose | Auth? | Request Body | Response |
|---|---|---|---|---|---|
| GET | /api/technician/profile | Technician profile | Yes, technician | none | profile, bank details, services |
| GET | /api/technician/profile/old-mobile | Current mobile prefill | Yes, technician | none | mobile status |
| POST | /api/technician/profile/send-mobile-otp | Send mobile OTP | Yes, technician | newMobileNumber | success, OTP in dev |
| POST | /api/technician/profile/verify-mobile-otp | Verify mobile OTP | Yes, technician | newMobileNumber, otp | updated mobile |
| POST | /api/technician/profile/send-email-otp | Send email OTP | Yes, technician | newEmail | success, OTP in dev |
| POST | /api/technician/profile/verify-email-otp | Verify email OTP | Yes, technician | newEmail, otp | updated email |
| PATCH | /api/technician/profile | Update profile | Yes, technician | fields, photo, optional bankDetails, services | updated profile |
| POST | /api/technician/profile/change-password | Change password | Yes, technician | oldPassword, newPassword | success |
| POST | /api/technician-availability | Upsert availability | Yes, technician | technicianId, date, timeSlots | updated schedule |
| GET | /api/technician-availability/:technicianId | Get availability by date | Yes | date in query | availability data |
| GET | /api/technician-availability | List availability | Yes | technicianId in query | availability list |

### Bookings and payment

| Method | Endpoint | Purpose | Auth? | Request Body | Response |
|---|---|---|---|---|---|
| POST | /api/bookings/precheck | Find eligible technicians | Yes | CustomerID, SubCategoryID, Date, TimeSlot | eligible technicians |
| POST | /api/bookings/create | Create booking | Yes | CustomerID, TechnicianID, SubCategoryID, Date, TimeSlot, PaymentID | booking record |
| POST | /api/bookings/broadcast | Broadcast booking | Yes | booking data | success |
| POST | /api/bookings/accept | Accept booking | Yes, technician | bookingId | confirmed booking, coins deducted |
| POST | /api/bookings/auto-cancel | Trigger auto cancel | Yes | bookingId | success |
| POST | /api/bookings/cancel | Cancel booking | Yes | bookingId | cancelled booking |
| GET | /api/bookings/customer/:customerId | Customer bookings | Yes | none | booking list |
| GET | /api/bookings/technician/pending | Technician pending requests | Yes | none | pending bookings |
| GET | /api/bookings/technician/accepted | Technician accepted bookings | Yes | none | accepted bookings |
| GET | /api/bookings/technician/completed | Technician completed bookings | Yes | none | completed bookings |
| GET | /api/bookings/:id | Booking by id | Yes | none | booking details |
| POST | /api/bookings/generate-arrival-otp | Generate arrival OTP | Yes, technician | bookingId | OTP expiry |
| POST | /api/bookings/verify-arrival-otp | Verify arrival OTP | Yes, technician | bookingId, otp | service started |
| POST | /api/bookings/generate-completion-otp | Generate completion OTP | Yes, technician | bookingId | OTP expiry |
| POST | /api/bookings/verify-completion-otp | Verify completion OTP | Yes, technician | bookingId, otp | completion verified |
| POST | /api/bookings/complete-service | Complete service | Yes, technician | bookingId | completed booking, payout, invoice |
| POST | /api/bookings/payment/create-order | Create booking payment order | Yes | SubCategoryID, Date, TimeSlot | Razorpay order details |
| POST | /api/bookings/payment/verify-authorization | Verify booking payment authorization | Yes | paymentId, razorpay IDs | authorized payment |

### Feedback, complaints, thresholds

| Method | Endpoint | Purpose | Auth? | Request Body | Response |
|---|---|---|---|---|---|
| POST | /api/feedback/submit | Submit/update feedback | Yes | bookingId, rating, feedbackText | feedback record |
| GET | /api/feedback/:bookingId | Get booking feedback | Yes | none | feedback or null |
| GET | /api/feedback/customer/all | Customer feedbacks | Yes | none | feedback list |
| GET | /api/feedback/admin/all | Admin feedback list | Yes, admin | none | all feedbacks |
| GET | /api/feedback/technician/all | Technician feedback list | Yes, technician | none | feedback list |
| POST | /api/complaints/submit | Submit/update complaint | Yes | bookingId, complaintText | complaint record |
| GET | /api/complaints/:bookingId | Get booking complaint | Yes | none | complaint or null |
| GET | /api/complaints/customer/all | Customer complaints | Yes | none | complaint list |
| GET | /api/complaints/admin/all | Admin complaint list | Yes, admin | none | all complaints |
| GET | /api/complaints/technician/all | Technician complaint list | Yes, technician | none | complaint list |
| GET | /api/thresholds | Get complaint thresholds | Yes | none | threshold values |
| PUT | /api/thresholds | Update complaint thresholds | Yes | warningThreshold, tempDeactivationThreshold, permanentDeactivationThreshold | updated thresholds |

### Subscription

| Method | Endpoint | Purpose | Auth? | Request Body | Response |
|---|---|---|---|---|---|
| GET | /api/subscription-packages | List packages | Yes | optional isActive | package list |
| GET | /api/subscription-packages/:id | Get package | Yes | none | package |
| POST | /api/subscription-packages | Create package | Yes, admin | name, coins, price, description, isActive | created package |
| PUT | /api/subscription-packages/:id | Update package | Yes, admin | fields | updated package |
| DELETE | /api/subscription-packages/:id | Delete package | Yes, admin | none | deleted package |
| PATCH | /api/subscription-packages/:id/toggle-status | Toggle package active flag | Yes, admin | none | toggled package |
| POST | /api/subscription-packages/:id/purchase | Purchase package | Yes, technician | none | history, wallet |
| GET | /api/subscription-packages/history | Purchase history | Yes, technician | none | history list with invoice path |
| POST | /api/subscription-packages/:id/create-order | Create Razorpay order | Yes, technician | none | order + paymentId |
| POST | /api/subscription-packages/verify-payment | Verify Razorpay payment | Yes, technician | razorpay fields, paymentId | finalized payment |
| GET | /api/subscription-packages/razorpay-health | Razorpay config check | No | none | configured flag |

### Chat

| Method | Endpoint | Purpose | Auth? | Request Body | Response |
|---|---|---|---|---|---|
| GET | /api/chat/list | List user chats | Yes | none | chats list |
| GET | /api/chat/:bookingId | Create or get chat | Yes | none | chat metadata |
| GET | /api/chat/:bookingId/messages | Get messages | Yes | page, limit | messages and unread count |
| POST | /api/chat/:bookingId/message | Send message | Yes | messageText, images | created message |
| POST | /api/chat/:bookingId/read | Mark messages read | Yes | optional messageIds | unreadCount |
| PATCH | /api/chat/:bookingId/read | Mark messages read | Yes | optional messageIds | unreadCount |

### Analytics

| Method | Endpoint | Purpose | Auth? | Request Body | Response |
|---|---|---|---|---|---|
| GET | /api/analytics/dashboard | Admin dashboard analytics | Yes, admin | none | KPI dashboard |
| GET | /api/analytics/weekly-revenue | Weekly revenue chart | Yes, admin | none | chart data |
| GET | /api/analytics/monthly-revenue | Monthly revenue chart | Yes, admin | none | chart data |
| GET | /api/analytics/booking-status | Booking status distribution | Yes, admin | none | chart data |
| GET | /api/analytics/revenue-by-service | Revenue by service | Yes, admin | period query | chart data |
| GET | /api/analytics/peak-hours | Peak hours | Yes, admin | none | chart data |
| GET | /api/analytics/top-technicians | Top technicians | Yes, admin | none | list |
| GET | /api/analytics/top-services | Top services | Yes, admin | none | list |
| GET | /api/analytics/top-locations | Top locations | Yes, admin | none | list |
| GET | /api/analytics/performance-metrics | Performance metrics | Yes, admin | none | metrics |
| GET | /api/analytics/financial-summary | Financial summary | Yes, admin | none | finance data |
| GET | /api/analytics/most-booked-services | Most booked services | Yes, admin | period query | chart data |
| GET | /api/analytics/monthly-bookings-by-category | Monthly bookings by category | Yes, admin | month query | chart data |
| GET | /api/technician-analytics/dashboard | Technician dashboard analytics | Yes, technician | none | KPI dashboard |
| GET | /api/technician-analytics/weekly-earnings | Weekly earnings | Yes, technician | none | chart data |
| GET | /api/technician-analytics/monthly-earnings | Monthly earnings | Yes, technician | none | chart data |
| GET | /api/technician-analytics/monthly-earnings-by-month | Monthly earnings by month | Yes, technician | none | chart data |
| GET | /api/technician-analytics/booking-status | Booking status | Yes, technician | none | chart data |
| GET | /api/technician-analytics/revenue-by-service | Revenue by service | Yes, technician | period query | chart data |
| GET | /api/technician-analytics/recent-feedback | Recent feedback | Yes, technician | none | list |
| GET | /api/technician-analytics/upcoming-bookings | Upcoming bookings | Yes, technician | none | list |
| GET | /api/technician-analytics/most-booked-services | Most booked services | Yes, technician | none | list |
| GET | /api/technician-analytics/rating-trend | Rating trend | Yes, technician | none | chart data |
| GET | /api/technician-analytics/recent-transactions | Recent transactions | Yes, technician | none | list |
| GET | /api/technician-analytics/peak-hours | Peak hours | Yes, technician | none | chart data |
| GET | /api/technician-analytics/top-locations | Top locations | Yes, technician | none | chart data |

## 10. Admin Module

The admin module is built around [Client/src/pages/Admin.jsx](Client/src/pages/Admin.jsx), [Client/src/pages/AdminTechnicianRequest.jsx](Client/src/pages/AdminTechnicianRequest.jsx), [Client/src/pages/AdminTechnicianList.jsx](Client/src/pages/AdminTechnicianList.jsx), [Client/src/pages/TechnicianDetails.jsx](Client/src/pages/TechnicianDetails.jsx), [Client/src/pages/AdminCustomerList.jsx](Client/src/pages/AdminCustomerList.jsx), [Client/src/pages/AdminCategories.jsx](Client/src/pages/AdminCategories.jsx), [Client/src/pages/AdminSubscriptions.jsx](Client/src/pages/AdminSubscriptions.jsx), and [Client/src/pages/AdminFeedbacks.jsx](Client/src/pages/AdminFeedbacks.jsx).

Implemented admin features include technician approval and rejection in [Server/controllers/admin.controller.js](Server/controllers/admin.controller.js), customer listing in [Server/controllers/AdminCustomerList.controller.js](Server/controllers/AdminCustomerList.controller.js), service category CRUD in [Server/controllers/serviceCategory.controller.js](Server/controllers/serviceCategory.controller.js), subcategory CRUD in [Server/controllers/subServiceCategory.controller.js](Server/controllers/subServiceCategory.controller.js), subscription package management in [Server/controllers/subscriptionPackage.controller.js](Server/controllers/subscriptionPackage.controller.js), feedback viewing in [Server/controllers/feedback.controller.js](Server/controllers/feedback.controller.js), complaint viewing in [Server/controllers/complaint.controller.js](Server/controllers/complaint.controller.js), and analytics dashboards in [Server/controllers/analytics.controller.js](Server/controllers/analytics.controller.js).

## 11. Technician Module

The technician module is built around [Client/src/pages/TechnicianDashboard.jsx](Client/src/pages/TechnicianDashboard.jsx), [Client/src/pages/TechnicianAvailability.jsx](Client/src/pages/TechnicianAvailability.jsx), [Client/src/pages/TechnicianBookings.jsx](Client/src/pages/TechnicianBookings.jsx), [Client/src/pages/TechnicianSubscription.jsx](Client/src/pages/TechnicianSubscription.jsx), [Client/src/pages/TechnicianFeedbacks.jsx](Client/src/pages/TechnicianFeedbacks.jsx), [Client/src/pages/TechnicianProfile.jsx](Client/src/pages/TechnicianProfile.jsx), and [Client/src/pages/TechnicianAnalysis.jsx](Client/src/pages/TechnicianAnalysis.jsx).

Implemented technician features include registration, OTP verification, profile editing, email/mobile updates, password change, availability management, booking acceptance, arrival OTP, completion, coin-wallet consumption, subscription purchase, feedback viewing, and analytics. The main backend support is in [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js), [Server/controllers/technicianProfile.controller.js](Server/controllers/technicianProfile.controller.js), [Server/controllers/technicianAvailability.controller.js](Server/controllers/technicianAvailability.controller.js), [Server/controllers/booking.controller.js](Server/controllers/booking.controller.js), [Server/controllers/subscriptionPackage.controller.js](Server/controllers/subscriptionPackage.controller.js), [Server/controllers/feedback.controller.js](Server/controllers/feedback.controller.js), and [Server/controllers/technicianAnalytics.controller.js](Server/controllers/technicianAnalytics.controller.js).

## 12. Customer Module

The customer module is built around [Client/src/pages/LoginCustomer.jsx](Client/src/pages/LoginCustomer.jsx), [Client/src/pages/CustomerDashboard.jsx](Client/src/pages/CustomerDashboard.jsx), [Client/src/pages/CustomerServiceDetails.jsx](Client/src/pages/CustomerServiceDetails.jsx), [Client/src/pages/CustomerBookings.jsx](Client/src/pages/CustomerBookings.jsx), and [Client/src/pages/CustomerProfile.jsx](Client/src/pages/CustomerProfile.jsx).

Implemented customer features include mobile OTP login, browsing categories and services, opening service details, running booking precheck, placing bookings, paying through booking authorization, tracking booking status, chatting with technicians, submitting feedback, and submitting complaints. The backend support is in [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js), [Server/controllers/booking.controller.js](Server/controllers/booking.controller.js), [Server/controllers/bookingPayment.controller.js](Server/controllers/bookingPayment.controller.js), [Server/controllers/feedback.controller.js](Server/controllers/feedback.controller.js), [Server/controllers/complaint.controller.js](Server/controllers/complaint.controller.js), and [Server/controllers/customerProfile.controller.js](Server/controllers/customerProfile.controller.js).

## 13. System Design

### Request flow

The frontend sends requests from page components and shared context through Axios or fetch. Those requests land in route files such as [Server/routes/booking.route.js](Server/routes/booking.route.js), which forward into controllers.

### Response flow

Controllers return JSON responses with a `success` flag and either data or message. The frontend reads those results and updates local component state, global context, toasts, and navigation.

### Data flow

MongoDB collections are queried through Mongoose models. Relevant data is often populated across references, for example booking documents populate customer, technician, and sub-category data in [Server/controllers/booking.controller.js](Server/controllers/booking.controller.js), [Server/controllers/feedback.controller.js](Server/controllers/feedback.controller.js), and [Server/controllers/complaint.controller.js](Server/controllers/complaint.controller.js).

### Component communication

The app uses `AppContext` for auth and realtime state, nested route outlets for layout composition, and Socket.IO for live updates.

### Backend architecture

The backend follows a controller-route-model structure. Auxiliary concerns like authentication, mail, realtime delivery, file uploads, and payments are separated into middleware, config, services, and utils.

### Frontend architecture

The frontend uses route-based role panels, a global auth context, and page-level state with reusable UI components for modals, loaders, navbars, and booking/chat workflows.

## 14. Error Handling

Validation is implemented directly in controllers and also in the frontend forms. Examples include field checks in [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js), package validation in [Server/routes/subscriptionPackage.route.js](Server/routes/subscriptionPackage.route.js), and threshold checks in [Server/controllers/thresholds.controller.js](Server/controllers/thresholds.controller.js).

Exceptions are caught in most controllers with `try/catch`, and error responses usually return status codes with `success: false` plus a message. The booking and payment flows also persist failures into [Server/models/FailedPaymentOperation.js](Server/models/FailedPaymentOperation.js).

Authentication errors are returned by [Server/middleware/userAuth.js](Server/middleware/userAuth.js) and by route-level authorization checks in admin and technician-only endpoints.

Database-related failures are logged to the console in many controllers, and some flows add recovery behavior such as OTP cleanup in [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js) and auto-cancel scheduling in [Server/controllers/booking.controller.js](Server/controllers/booking.controller.js).

## 15. Security

JWT is used for authentication, with HTTP-only cookies set in [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js).

bcrypt is used for password hashing in [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js) and [Server/controllers/adminRegister.controller.js](Server/controllers/adminRegister.controller.js).

Input validation is present in frontend forms and backend controllers. File uploads are restricted with Multer and image filters in [Server/routes/auth.route.js](Server/routes/auth.route.js), [Server/routes/serviceCategory.route.js](Server/routes/serviceCategory.route.js), [Server/routes/subServiceCategory.route.js](Server/routes/subServiceCategory.route.js), [Server/routes/technicianProfile.route.js](Server/routes/technicianProfile.route.js), and [Server/routes/chat.route.js](Server/routes/chat.route.js).

Authorization is enforced by [Server/middleware/userAuth.js](Server/middleware/userAuth.js) and role checks in route files and controllers.

CORS, Helmet, HPP, and rate limiting are configured in [Server/server.js](Server/server.js). Environment variables are used for DB URLs, JWT secret, SMTP, Twilio, Razorpay, Google OAuth, and frontend URLs.

## 16. Performance

Pagination is implemented in several frontend list pages such as [Client/src/pages/CustomerBookings.jsx](Client/src/pages/CustomerBookings.jsx), [Client/src/pages/TechnicianBookings.jsx](Client/src/pages/TechnicianBookings.jsx), [Client/src/pages/AdminCustomerList.jsx](Client/src/pages/AdminCustomerList.jsx), and [Client/src/pages/TechnicianAnalysis.jsx](Client/src/pages/TechnicianAnalysis.jsx).

Socket.IO reduces polling by pushing realtime updates through [Server/config/realtime.js](Server/config/realtime.js) and [Client/src/context/AppContext.jsx](Client/src/context/AppContext.jsx).

Database optimization includes indexes on `Technician.location`, `Customer.location`, `TechnicianAvailability(technicianId,date)`, `Chat` lookups, `Message` lookups, `SubscriptionPackage`, and `FailedPaymentOperation`.

Image optimization appears in upload paths and `processUploadedImage` usage in category, subcategory, technician, and auth flows.

Caching is not visibly implemented as a dedicated cache layer in the codebase.

## 17. Challenges Solved in Code

The codebase solves several non-trivial implementation problems:

1. Multi-role auth and routing, handled by JWT typing and route guards.
2. Technician approval gating, handled by `VerifyStatus` and `ActiveStatus` checks.
3. Booking race conditions and duplicate slot protection, handled in `createBooking`.
4. Technician coin economy, handled by `TechnicianWallet`, `SubscriptionPackage`, and `acceptBooking`.
5. OTP-based arrival and completion verification, handled by `BookingArrivalOTP` and booking OTP endpoints.
6. Realtime updates for database and chat, handled by Socket.IO in [Server/config/realtime.js](Server/config/realtime.js).
7. Complaint escalation and temporary deactivation, handled by complaint thresholds and reactivation scheduling.
8. Payment authorization and later capture/refund flows, handled by booking payment and subscription payment controllers.

## 18. Interview Questions and Answers

### 1. What is Technosys?
Technosys is a MERN service-management platform with separate customer, technician, and admin flows. The implementation is centered in [Server/server.js](Server/server.js) and [Client/src/App.jsx](Client/src/App.jsx).

### 2. What problem does it solve?
It coordinates home-service booking, technician assignment, service lifecycle verification, chat, payments, feedback, and admin control in one app.

### 3. What roles exist?
The code implements `admin`, `technician`, `customer`, and `google`-backed login identity.

### 4. How is auth stored?
Auth is stored in an HTTP-only JWT cookie named `token`.

### 5. Where is JWT verified?
In [Server/middleware/userAuth.js](Server/middleware/userAuth.js).

### 6. How are technician passwords secured?
They are hashed with bcrypt before storage.

### 7. How does customer login work?
The customer requests a mobile OTP, verifies it, and then receives a JWT cookie.

### 8. How does technician registration work?
The technician submits files, verified OTPs, and profile data through the registration endpoint.

### 9. How does admin approval work?
Admin changes technician status to approved or rejected and sends email notifications.

### 10. How do bookings start?
The customer selects a sub-service, runs precheck, and creates a booking.

### 11. How are technicians found?
The backend checks the customer’s location and service category to find eligible technicians.

### 12. How is duplicate booking prevented?
`createBooking` searches for an active booking at the same slot before creating a new one.

### 13. How do technicians accept jobs?
`acceptBooking` checks the wallet balance, deducts coins, confirms the booking, and emits live updates.

### 14. Why are coins used?
Coins act as an access control mechanism for accepting bookings.

### 15. How is technician availability stored?
In [Server/models/TechnicianAvailability.js](Server/models/TechnicianAvailability.js) as date-based time-slot documents.

### 16. How does arrival verification work?
The technician generates an OTP and the customer receives it by email.

### 17. How does service completion work?
The technician completes the job after arrival verification, and the backend creates payout and invoice records.

### 18. How does feedback work?
A customer can submit or update feedback only for completed bookings they own.

### 19. How does complaint handling work?
Complaints are tied to completed bookings and can trigger technician warnings or deactivation.

### 20. How are complaint thresholds managed?
They are stored in [Server/models/ComplaintThresholds.js](Server/models/ComplaintThresholds.js) and editable through the thresholds controller.

### 21. How does chat work?
A chat is created per booking, messages are stored in MongoDB, and Socket.IO is used for live updates.

### 22. Is chat tied to booking?
Yes, each chat references one booking in [Server/models/Chat.js](Server/models/Chat.js).

### 23. How are unread counts handled?
Unread counts are stored on the chat document and recalculated by message helper methods.

### 24. How is subscription handled?
Technicians can purchase packages that add coins to their wallet.

### 25. How are subscription payments tracked?
Through [Server/models/SubscriptionPayment.js](Server/models/SubscriptionPayment.js) and [Server/models/SubscriptionHistory.js](Server/models/SubscriptionHistory.js).

### 26. Is Razorpay implemented?
Yes, both for bookings and subscription payments.

### 27. How are invoices generated?
The code uses `generateInvoice` from [Server/services/invoice.service.js](Server/services/invoice.service.js).

### 28. How are refunds handled?
Refund records are stored in [Server/models/Refund.js](Server/models/Refund.js) and email notifications are sent on cancellation paths.

### 29. How is the frontend protected?
Through [Client/src/App.jsx](Client/src/App.jsx) route guards and redirect logic.

### 30. What is AppContext used for?
It stores auth state, user data, backend URL, realtime subscriptions, and the Socket.IO connection.

### 31. Why use nested layouts?
It keeps admin, technician, and customer UIs separate while sharing routing and authentication.

### 32. How are service categories managed?
Admins can create, update, deactivate, and list categories and subcategories.

### 33. What is the difference between delete and remove here?
Category and subcategory deletion is soft delete through `isActive = false`.

### 34. How is login brute-force protection implemented?
Through [Server/models/LoginBlock.js](Server/models/LoginBlock.js) plus reCAPTCHA and temporary blocking in `login`.

### 35. How are OTPs cleaned up?
Expired OTP records are removed by a cleanup job in [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js).

### 36. How is the app made realtime?
By emitting `db_change` and chat events from Socket.IO.

### 37. What does `db_change` do?
It notifies frontend subscribers when MongoDB documents change.

### 38. Does the app support Google login?
Yes, through Passport Google OAuth and [Server/models/userGoogleModel.js](Server/models/userGoogleModel.js).

### 39. How is email sending done?
With Nodemailer and SMTP settings from environment variables.

### 40. How is customer profile stored?
In [Server/models/Customer.js](Server/models/Customer.js), including structured address and geolocation.

### 41. How is technician profile stored?
In [Server/models/Technician.js](Server/models/Technician.js), including address, OTP status, files, and approval state.

### 42. What is the purpose of `ServiceRequest`?
It stores booking job metadata and the technician broadcast list.

### 43. How is search handled on the admin customer list?
With a query filter across `Name`, `Email`, and `Mobile`.

### 44. How are charts built?
With Recharts in the admin and technician analytics pages.

### 45. How is the booking status visualized?
With `BookingTracker` in [Client/src/components/BookingTracker.jsx](Client/src/components/BookingTracker.jsx).

### 46. How do booking notifications reach the UI?
Through Socket.IO plus browser notifications in the customer and technician pages.

### 47. What is the role of `TempPage` and `AdminTechnicianCompliant`?
They are placeholder/temporary pages in the route tree.

### 48. Is every visible UI route backed by a server route?
No. For example, some email verification routes are present in the UI, but the older `/verify-account` style auth routes are commented out in the server routes.

### 49. What is the biggest architectural strength?
The project separates role-specific workflows cleanly while sharing the same auth and realtime infrastructure.

### 50. What is the biggest technical risk?
The implementation relies on many coordinated flows: auth, OTP, chat, payment, and booking lifecycle, so regressions can appear if one collection or event contract changes.

## 19. Explain Like an Interview

### 30-second version
Technosys is a MERN-based home-service marketplace where customers book services, technicians manage availability and accept jobs, and admins approve technicians and manage operations. The backend uses JWT auth, Mongoose models, Socket.IO realtime updates, OTP verification, Razorpay payments, and email notifications.

### 1-minute version
Technosys connects customers, technicians, and admins in a service booking workflow. Customers can sign in with OTP, search services, book appointments, chat with technicians, and leave feedback or complaints. Technicians register with verification, manage availability, accept bookings using a coin-based subscription system, and complete jobs using OTP confirmation. Admins approve technicians, manage categories and subscriptions, and review analytics. The system is built with React, Express, MongoDB, JWT, Passport Google OAuth, Nodemailer, Razorpay, and Socket.IO.

### 3-minute version
Technosys is a full-stack service management platform. On the frontend, a Vite React app uses route-based role panels for customers, technicians, and admins. On the backend, Express routes map to controllers that manage auth, bookings, subscriptions, analytics, chat, complaints, and feedback. Authentication uses JWT cookies and role checks. Technicians must complete OTP verification and admin approval before they can log in. Customers can log in with mobile OTP, book services, and track booking status. The booking workflow includes precheck, duplicate-slot prevention, technician acceptance with coin deduction, arrival OTP verification, service completion, invoice generation, and optional refund or payout handling. The app also uses Socket.IO for realtime chat and status updates, and it sends transactional emails for OTPs, approvals, payment events, and notifications.

### Technical version
The backend uses a controller-service-model architecture with Mongoose schemas for bookings, payments, chats, complaints, feedback, subscriptions, wallet balances, and OTP records. The auth layer is centralized in `userAuth`, which verifies JWT cookies and sets `req.userType`. Booking state transitions are implemented as controller methods with side effects such as wallet deduction, slot locking, chat creation, invoice generation, email notifications, and scheduled cancellations. The frontend uses `AppContext` to restore session state and Socket.IO to subscribe to realtime updates. Layout components and nested routes keep role-based experiences separate while sharing a single application shell.

### HR version
I worked on a multi-role service-management platform where different user types have different permissions and workflows. My role involved designing and implementing the core application flow so customers could book services, technicians could manage jobs and availability, and admins could approve and monitor operations. I also handled authentication, booking lifecycle logic, realtime updates, payment flows, and communication features like email notifications and chat.

## 20. My Contribution

Based on the code, your contribution can be described as building the core end-to-end platform logic: role-based authentication, technician onboarding and approval, customer booking flows, booking acceptance and completion, chat, feedback, complaints, subscriptions, payment handling, realtime updates, and analytics. In interview terms, you can say you owned the full service-lifecycle implementation across frontend and backend, not just UI or just APIs.

## 21. Final Notes

One visible implementation mismatch is that [Client/src/pages/EmailVerify.jsx](Client/src/pages/EmailVerify.jsx) still points to older `/api/auth/verify-account` style routes, while those routes are commented out in [Server/routes/auth.route.js](Server/routes/auth.route.js). The currently active email-OTP flow is the one implemented in [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js) and [Server/controllers/technicianProfile.controller.js](Server/controllers/technicianProfile.controller.js).

The most important files for interview review are [Server/server.js](Server/server.js), [Server/middleware/userAuth.js](Server/middleware/userAuth.js), [Server/controllers/auth.controller.js](Server/controllers/auth.controller.js), [Server/controllers/booking.controller.js](Server/controllers/booking.controller.js), [Server/controllers/subscriptionPackage.controller.js](Server/controllers/subscriptionPackage.controller.js), [Server/config/realtime.js](Server/config/realtime.js), [Client/src/App.jsx](Client/src/App.jsx), and [Client/src/context/AppContext.jsx](Client/src/context/AppContext.jsx).
