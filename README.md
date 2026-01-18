🏠 Technosys – The Service Management System

The platform connects customers with verified technicians for home services such as plumbing, electrical work, appliance repair, and more.
The system aims to solve real-world problems related to finding reliable technicians, secure service booking, and centralized service management.

🎯 Problem Statement

Customers often struggle to find trusted technicians and rely on word-of-mouth or unverified sources.
Technicians, on the other hand, lack a proper system to get consistent work and manage schedules.
Admins face difficulties monitoring technicians, bookings, payments, and complaints manually.

Technosys addresses these issues by providing a secure, automated, and scalable service platform Technosys.

📌 Project Scope

• Only verified technicians (approved by admin) can accept bookings
• Services are limited to a defined city area
• Only single-service booking is allowed at a time
• Secure OTP-based authentication and verification
• Admin-controlled subscriptions, complaints, and reports

👥 User Roles
  👤 Customer
  • Login using mobile OTP
  • Manage profile and address
  • Book services with date & time selection
  • OTP-based technician arrival verification
  • Chat with technician in real time
  • Receive digital invoice via email
  • Submit feedback and complaints

  🧑‍🔧 Technician
  • Register with ID proof and admin approval
  • Manage availability slots
  • Receive real-time booking requests
  • Accept jobs on first-come-first-serve basis
  • Coin-based system to accept bookings
  • Wallet & subscription management
  • OTP verification for arrival & service completion

  🧑‍💼 Admin
  • Approve / reject technicians
  • Manage service categories & pricing
  • Manage subscription plans and coin rules
  • Monitor bookings, revenue, and analytics
  • Handle complaints and deactivate technicians if needed
  • Generate reports and invoices

💰 Coin & Subscription System
  • Technicians must have sufficient coins to accept a booking
  • Coins are obtained via subscription plans
  • Coins are automatically deducted per service
  • Wallet balance and usage history are tracked
  • Prevents spam acceptance and enforces fair usage

🔔 Automation & Workflow
  • Address validation before booking
  • Location-based technician matching
  • Auto-cancel booking if no technician accepts in time
  • OTP-based service lifecycle:
    Arrival → In-Progress → Completed
  • Automatic invoice generation and email delivery
  • Complaint threshold-based technician deactivation

🛠 Technology Stack
  Frontend
    • React.js
    • HTML, CSS, JavaScript
    • Tailwind CSS
  Backend
    • Node.js
    • Express.js
    • Socket.io (real-time communication)
    • JWT Authentication
  Database
    • MongoDB (MongoDB Atlas)
  Deployment  
    • Render (Frontend & Backend)

🚀 Future Enhancements
  • Mobile application for customers and technicians
  • Real-time technician tracking
  • Expansion to multiple cities
  • AI-based technician recommendation
  • Enhanced security and analytics  
