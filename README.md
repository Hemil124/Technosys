# Technosys — Service Management System

A full-stack MERN application that connects customers with verified technicians for home services such as plumbing, electrical work, appliance repair, and more. Built to provide secure service booking, real-time communication, and centralized service management.

---

## Project Overview

This project demonstrates a complete service management workflow — from user authentication to booking, technician assignment, service completion, and invoicing — designed to reflect real-world service marketplace platforms.

The system supports three user roles: Customer, Technician, and Admin, each with clearly defined responsibilities and permissions.

---

## Key Features

### Customer
- Mobile OTP-based login
- Profile and address management
- Service booking with date and time selection
- Location-based technician matching
- OTP-based technician arrival verification
- Real-time chat with technician
- Digital invoice sent via email
- Feedback and complaint submission

### Technician
- Registration with ID proof and admin approval
- Availability slot management
- Real-time booking request notifications
- First-come-first-serve job acceptance
- Coin-based system for accepting bookings
- Wallet and subscription management
- OTP-based service start and completion verification

### Admin
- Technician approval and management
- Service category and pricing management
- Subscription and coin rule management
- Booking and revenue monitoring
- Complaint handling and technician deactivation
- Report and invoice generation

---

## Coin & Subscription System

Technicians are required to maintain a coin balance to accept service bookings. Coins are obtained through subscription plans and are automatically deducted when a booking is accepted. Wallet balance and usage history are tracked to ensure fair usage and prevent spam booking acceptance.

---

## Automation & Workflow

- Address validation before booking
- Location-based technician discovery
- Automatic booking cancellation if no technician accepts within a defined time
- OTP-based service lifecycle:
  Arrival → In-Progress → Completed
- Automatic invoice generation and email delivery
- Complaint-based technician status control

---

## Technology Stack

**Frontend**
- React.js
- HTML, CSS, JavaScript
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- Socket.io
- JWT Authentication

**Database**
- MongoDB (MongoDB Atlas)

**Deployment**
- Render (Frontend & Backend)

---

## Future Enhancements

- Mobile application for customers and technicians
- Real-time technician tracking
- Multi-city service expansion
- AI-based technician recommendation
- Advanced analytics and security improvements

---

## License

This project is developed for academic and educational purposes.
