# Meera Clinic Appointment Booking System

This project is an AI-powered assistant and scheduling system for
**Meera Clinic**.\
It allows patients to book appointments, check availability, and
retrieve clinic information seamlessly.

------------------------------------------------------------------------

## 🌍 Deployment

- **Production (Vercel):** [https://meeraclinic.vercel.app](https://meeraclinic.vercel.app)  
- **API Endpoint:** [https://meeraclinic.vercel.app/api/chat](https://meeraclinic.vercel.app/api/chat)

------------------------------------------------------------------------

## 🚀 Features

-   Book appointments with doctors
-   Suggest next available slot automatically
-   Check existing appointments by patient or ID
-   Clinic info retrieval (hours, services, emergency contacts)
-   Doctor availability overview

------------------------------------------------------------------------

## 📂 Project Structure

    lib/
      tools/
        functions.js     # Core logic for booking, availability, slots, etc.
    database/
      doctors.js         # Mock doctor data with working hours and specialties
      appointments.json  # Appointment storage (mock database)

------------------------------------------------------------------------

## 🛠️ Usage

### 1. Install dependencies

``` bash
npm install
```

### 2. Run development server (Next.js)

``` bash
npm run dev
```

### 3. Booking an Appointment

The system checks: - Doctor working hours - Existing appointments -
10-minute buffer after each appointment - Current time + 10 min buffer
(if same day)

### 4. Checking Appointments

``` js
checkAppointment({ patientName: "John Doe" })
checkAppointment({ appointmentId: 1 })
```

### 5. Example Appointment Object

``` json
{
  "id": 1,
  "patientName": "Raj Sharma",
  "patientPhone": "91XXXXXXXX",
  "doctorId": 4,
  "date": "2025-08-17",
  "startTime": "13:38",
  "endTime": "13:58",
  "status": "confirmed",
  "reason": "vomiting and fever"
}
```

------------------------------------------------------------------------

## 👨‍⚕️ Clinic Information

-   Name: Meera Clinic
-   Address: 123 Health Street, Medical District, City 12345
-   Phone: +1 (555) 123-4567
-   Email: info@meeraclinic.com
-   Hours: 24/7

------------------------------------------------------------------------

## 📌 Notes

-   This system currently uses a **JSON file** as storage
    (`appointments.json`).
-   In production, replace with a real **database** (MongoDB,
    PostgreSQL, etc.).
-   Buffers are currently set to **10 minutes** between appointments.

------------------------------------------------------------------------

## 🏥 Author

Developed for educational purpose with ❤️ By RAJ (thefstack)
