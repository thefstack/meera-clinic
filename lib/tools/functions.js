// lib/tools/functions.js

import fs from "fs";
import path from "path";
import mockDoctors from "@/database/doctors.js";

const filePath = path.resolve("database/appointments.json");

// ---------- JSON Helpers ----------
function loadAppointments() {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading appointments.json:", err);
    return [];
  }
}

function saveAppointments(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing appointments.json:", err);
  }
}

// ---------- Utils ----------
function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toTimeString(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ---------- Current Date and Time ----------
export function getCurrentDateAndTime() {
  const now = new Date();
  return {
    date: now.toISOString().split("T")[0], // YYYY-MM-DD
    time: now.toTimeString().split(" ")[0] // HH:mm:ss
  };
}

// ---------- Doctors ----------
export async function getDoctors({ specialty }) {
  let doctors = mockDoctors;
  if (specialty) {
    doctors = doctors.filter(doc =>
      doc.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  }
  return { doctors };
}

// ---------- Availability ----------
export async function getDoctorAvailability({ doctorId, date }) {
  const doctor = mockDoctors.find(d => d.id === doctorId);
  if (!doctor) return { error: "Doctor not found" };

  console.log(doctor);

  const appointments = loadAppointments().filter(
    appt => appt.doctorId === doctorId && appt.date === date
  );

  console.log("Appointments for doctor:", appointments);

  return { doctor: doctor.name, date, appointments };
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
  console.log("Booking appointment:", { patientName, patientPhone, doctorId, date, startTime, duration, reason });
  const doctor = mockDoctors.find(d => d.id === doctorId);
  if (!doctor) return { error: "Doctor not found" };

  const appointments = loadAppointments();

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
    duration
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
  saveAppointments(appointments);

  return {
    success: true,
    appointment: newAppt,
    message: "Appointment booked successfully!"
  };
}

// ---------- Check Appointment ----------
export async function checkAppointment({ patientName, appointmentId }) {
  const appointments = loadAppointments();
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
}

// ---------- Clinic Info ----------
export async function getClinicInfo({ infoType }) {
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
}

// ---------- Suggest Next Available Slot ----------
export async function getNextAvailableTime({
  doctorId,
  date,
  requestedTime,
  duration = 20
}) {
  const doctor = mockDoctors.find(d => d.id === doctorId);
  if (!doctor) return { error: "Doctor not found" };

  const appointments = loadAppointments()
    .filter(appt => appt.doctorId === doctorId && appt.date === date)
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  const minGap = 5; // gap between appointments
  let currentTime = toMinutes(requestedTime);

  const workStart = toMinutes(doctor.workingHours.start);
  const workEnd = toMinutes(doctor.workingHours.end);

  // 🟢 If requested time is before working hours → start at workStart
  if (currentTime < workStart) currentTime = workStart;

  // 🟢 If the date is today, don't suggest past slots — add 10 min buffer
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

    const conflict = appointments.find(appt => {
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
}



// ---------- getDoctorDetailsById ----------
export async function getDoctorDetails({doctorId}) {
  const doctor = mockDoctors.find(d => d.id == doctorId);
  if (!doctor) return { error: "Doctor not found" };

  return {
    doctor
  };
}