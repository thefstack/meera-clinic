// lib/tools/functions.js

import path from "path";
import mockDoctors from "@/database/doctors.js";

// ---------- JSON Helpers (via API) ----------
async function loadAppointments() {
  try {
    const res = await fetch("/api/appointments/storage", {
      cache: "no-store", // always fresh
    });

    return await res.json();
  } catch (err) {
    console.error("Error fetching appointments:", err);
    return [];
  }
}

async function saveAppointments(data) {
  try {
    await fetch("/api/appointments/storage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error("Error saving appointments:", err);
  }
}

// ---------- Utils ----------
function toMinutes(time) {
  try {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  } catch (err) {
    console.error("Error converting time to minutes:", err);
    return 0;
  }
}

function toTimeString(minutes) {
  try {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  } catch (err) {
    console.error("Error converting minutes to time string:", err);
    return "00:00";
  }
}

// ---------- Current Date and Time ----------
export function getCurrentDateAndTime() {
  try {
    const now = new Date();
    return {
      date: now.toISOString().split("T")[0], // YYYY-MM-DD
      time: now.toTimeString().split(" ")[0] // HH:mm:ss
    };
  } catch (err) {
    console.error("Error getting current date and time:", err);
    return {
      date: "1970-01-01",
      time: "00:00:00"
    };
  }
}

// ---------- Doctors ----------
export async function getDoctors({ specialty }) {
  try {
    let doctors = mockDoctors;
    if (specialty) {
      doctors = doctors.filter(doc =>
        doc.specialty.toLowerCase().includes(specialty.toLowerCase())
      );
    }
    return { doctors };
  } catch (err) {
    console.error("Error getting doctors:", err);
    return { doctors: [] };
  }
}

// ---------- Availability ----------
export async function getDoctorAvailability({ doctorId, date }) {
  try {
    const doctor = mockDoctors.find(d => d.id === doctorId);
    if (!doctor) return { error: "Doctor not found" };

    const appointments = await loadAppointments(); // Add await here

    console.log("appointments:", appointments);
    console.log("doctorId:", doctorId);
    const filteredAppointments = appointments.filter(
      appt => appt.doctorId === doctorId && appt.date === date
    );

    console.log("Appointments for doctor:", filteredAppointments);

    return { doctor: doctor.name, date, appointments: filteredAppointments };
  } catch (err) {
    console.error("Error getting doctor availability:", err);
    return { error: "Failed to get doctor availability" };
  }
}

// ---------- Booking ----------
export async function bookAppointment({
  patientName,
  patientPhone,
  doctorId,
  date,
  startTime,
  duration = 20, // default 20 mins
  reason
}) {
  try {
    console.log("Booking appointment:", { patientName, patientPhone, doctorId, date, startTime, duration, reason });
    const doctor = mockDoctors.find(d => d.id === doctorId);
    if (!doctor) return { error: "Doctor not found" };

    const appointments = await loadAppointments();

    const workStart = toMinutes(doctor.workingHours.start);
    const workEnd = toMinutes(doctor.workingHours.end);
    const reqStart = toMinutes(startTime);
    const reqEnd = reqStart + duration;

    if (reqStart < workStart || reqEnd > workEnd) {
      return {
        error: `Doctor only works between ${doctor.workingHours.start} and ${doctor.workingHours.end}`
      };
    }

    // check slot suggestion
    const suggestion = await getNextAvailableTime({
      doctorId,
      date,
      requestedTime: startTime,
      reqEnd
    });

    if (suggestion.error) {
      return { error: "No slots available today" };
    }

    if (suggestion.nextAvailable !== startTime) {
      return {
        success: false,
        message: `The requested time is not available.`,
        suggestion
      };
    }

    const newStart = toMinutes(startTime);
    const newEnd = newStart + duration;
    const minGap = 30;

    // conflict check
    const conflict = appointments.find(appt => {
      if (appt.doctorId !== doctorId || appt.date !== date) return false;

      const apptStart = toMinutes(appt.startTime);
      const apptEnd = toMinutes(appt.endTime);

      const overlap = !(newEnd <= apptStart || newStart >= apptEnd);
      const tooClose =
        Math.abs(newStart - apptEnd) < minGap ||
        Math.abs(apptStart - newEnd) < minGap;

      return overlap || tooClose;
    });

    if (conflict) {
      return {
        error: `Doctor not available at ${startTime}. Please pick another time.`
      };
    }

    // save appointment
    const newAppt = {
      id: appointments.length + 1,
      patientName,
      patientPhone,
      doctorId,
      date,
      startTime,
      endTime: toTimeString(newEnd),
      status: "confirmed",
      reason
    };

    appointments.push(newAppt);
    await saveAppointments(appointments);

    return {
      success: true,
      appointment: newAppt,
      message: "Appointment booked successfully!"
    };
  } catch (err) {
    console.error("Error booking appointment:", err);
    return { error: "Failed to book appointment" };
  }
}

// ---------- Check Appointment ----------
export async function checkAppointment({ patientName, appointmentId }) {
  try {
    const appointments = await loadAppointments();
    let result = appointments;

    if (appointmentId) {
      result = result.filter(apt => apt.id === appointmentId);
    } else if (patientName) {
      result = result.filter(apt =>
        apt.patientName.toLowerCase().includes(patientName.toLowerCase())
      );
    }

    if (result.length === 0) return { error: "No appointments found" };
    return { appointments: result };
  } catch (err) {
    console.error("Error checking appointment:", err);
    return { error: "Failed to check appointment" };
  }
}

// ---------- Clinic Info ----------
export async function getClinicInfo({ infoType }) {
  try {
    return {
      clinicInfo: {
        name: "Meera Clinic",
        address: "123 Health Street, Medical District, City 12345",
        phone: "+1 (555) 123-4567",
        email: "info@meeraclinic.com",
        hours: {
          daily: "24/7",
          emergency: "24/7 Emergency Services"
        },
        services: [
          "General Consultation",
          "Specialist Care",
          "Emergency Services",
          "Health Checkups",
          "Diagnostic Tests"
        ],
        emergency:
          "For emergencies, call 911 or visit the nearest emergency room"
      }
    };
  } catch (err) {
    console.error("Error getting clinic info:", err);
    return { error: "Failed to get clinic information" };
  }
}

// ---------- Suggest Next Available Slot ----------
export async function getNextAvailableTime({
  doctorId,
  date,
  requestedTime,
  duration = 20
}) {
  try {

    console.log("data:", { doctorId, date, requestedTime, duration });
    
    const doctor = mockDoctors.find(d => d.id === doctorId);
    if (!doctor) return { error: "Doctor not found" };

    const appointments = await loadAppointments(); // First await the promise
    const filteredAppointments = appointments
      .filter(appt => appt.doctorId === doctorId && appt.date === date)
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

    const minGap = 5; // gap between appointments
    let currentTime = toMinutes(requestedTime);

    const workStart = toMinutes(doctor.workingHours.start);
    const workEnd = toMinutes(doctor.workingHours.end);

    //  If requested time is before working hours → start at workStart
    if (currentTime < workStart) currentTime = workStart;

    //  If the date is today, don't suggest past slots — add 10 min buffer
    const today = new Date().toISOString().split("T")[0];
    if (date === today) {
      const nowMinutes = toMinutes(new Date().toTimeString().slice(0, 5));
      const bufferedNow = nowMinutes + 10; // ⏱ add 10 min buffer
      if (currentTime < bufferedNow) {
        currentTime = bufferedNow;
      }
    }

    while (currentTime + duration <= workEnd) {
      const newStart = currentTime;
      const newEnd = newStart + duration;

      const conflict = filteredAppointments.find(appt => {
        const apptStart = toMinutes(appt.startTime);
        const apptEnd = toMinutes(appt.endTime);

        const overlap = !(newEnd <= apptStart || newStart >= apptEnd);
        const tooClose =
          Math.abs(newStart - apptEnd) < minGap ||
          Math.abs(apptStart - newEnd) < minGap;

        return overlap || tooClose;
      });

      if (!conflict) {
        return {
          nextAvailable: toTimeString(newStart),
          endTime: toTimeString(newEnd),
          duration,
          date,
          doctor: doctor.name
        };
      }

      // shift after conflict + buffer
      const conflictEnd = toMinutes(conflict.endTime);
      currentTime = conflictEnd + minGap;
    }

    return { error: "No slots available today" };
  } catch (err) {
    console.error("Error getting next available time:", err);
    return { error: "Failed to find available time slot" };
  }
}



// ---------- getDoctorDetailsById ----------
export async function getDoctorDetails({doctorId}) {
  try {
    const doctor = mockDoctors.find(d => d.id == doctorId);
    if (!doctor) return { error: "Doctor not found" };

    return {
      doctor
    };
  } catch (err) {
    console.error("Error getting doctor details:", err);
    return { error: "Failed to get doctor details" };
  }
}



// ---------- getAllSpecialistAtClinic ----------
export async function getAllSpecialistAtClinic() {
  try {
    const specialties = [...new Set(mockDoctors.map(doc => doc.specialty))];
    return { specialties };
  } catch (err) {
    console.error("Error getting specialties:", err);
    return { specialties: [] };
  }
}