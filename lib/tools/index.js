import * as funcs from "./functions";

export const appointmentTools = [
  {
    type: "function",
    name: "getCurrentDateAndTime",
    description: "Get current date and time in YYYY-MM-DD and HH:mm:ss format"
  },
  {
    type: "function",
    name: "getDoctors",
    description: "Get list of available doctors and their specialties",
    parameters: {
      type: "object",
      properties: {
        specialty: { type: "string", description: "Filter doctors by specialty" }
      },
      required: []
    }
  },
  {
    type: "function",
    name: "getDoctorAvailability",
    description: `
      Get the FULL schedule of a doctor for a given date.
      Use this ONLY to see all available slots
      for a day, not when want the next available time.
    `,
    parameters: {
      type: "object",
      properties: {
        doctorId: { type: "number", description: "Doctor ID" },
        date: { type: "string", description: "Date in YYYY-MM-DD format" }
      },
      required: ["doctorId", "date"]
    }
  },
  {
    type: "function",
    name: "bookAppointment",
    description: "Book an appointment with a doctor",
    parameters: {
      type: "object",
      properties: {
        patientName: { type: "string", description: "Patient's full name" },
        patientPhone: { type: "string", description: "Patient's phone number" },
        doctorId: { type: "number", description: "Doctor ID" },
        date: { type: "string", description: "Date in YYYY-MM-DD format" },
        startTime: { type: "string", description: "Start time in HH:mm format" },
        reason: { type: "string", description: "Reason for the appointment" }
      },
      required: ["patientName", "patientPhone", "doctorId", "date", "startTime", "reason"]
    }
  },
  {
    type: "function",
    name: "checkAppointment",
    description: "Check status of a booked appointment",
    parameters: {
      type: "object",
      properties: {
        patientName: { type: "string" },
        appointmentId: { type: "number" }
      },
      required: []
    }
  },
  {
    type: "function",
    name: "getClinicInfo",
    description: "Get general clinic information such as hours, services, or address",
    parameters: {
      type: "object",
      properties: {
        infoType: { type: "string", description: "Type of info (e.g., hours, services)" }
      },
      required: []
    }
  },
  {
    type: "function",
    name: "getNextAvailableTime",
    description: `
      Get ONLY the NEXT available time slot for a doctor.
      Do NOT call getDoctorAvailability together with this.
    `,
    parameters: {
      type: "object",
      properties: {
        doctorId: { type: "number", description: "Doctor ID" },
        date: { type: "string", description: "Date in YYYY-MM-DD format" },
        requestedTime: { type: "string", description: "HH:mm format (optional)" }
      },
      required: ["doctorId", "date", "requestedTime"]
    }
  },

  {
    type: "function",
    name: "getDoctorDetails",
    description: "Get details of a specific doctor by ID",
    parameters: {
      type: "object",
      properties: {
        doctorId: { type: "string", description: "Doctor ID" }
      },
      required: ["doctorId"]
    }
  },

  {
    type: "function",
    name: "endCall",
    description: "This is for ending the call. Use this function to end the call when the user is done with their queries.",
  },
  {
    type: "function",
    name: "getAllSpecialistAtClinic",
    description: "get all the specialist available at the clinic. use this function to know the specialist available at the clinic. This will help you to get all the speciality available at the clinic",
  }

];



export async function handleFunctionCall(name, args, fixedDoctorId) {
  // If doctorId is locked, override or block
  if (fixedDoctorId) {
    if (name === "getDoctors") {
      // 🚫 Block listing other doctors
      return {
        message: `This session is locked to doctor ID ${fixedDoctorId}. I cannot fetch other doctors.`,
        doctors: []
      };
    }

    if (["getDoctorDetails", "getDoctorAvailability", "bookAppointment", "getNextAvailableTime"].includes(name)) {
      args.doctorId = String(fixedDoctorId); // ✅ Force correct doctorId
    }
  }

  // Delegate to your actual functions
  if (funcs[name]) {
    return await funcs[name](args);
  }

  return { error: "Unknown function" };
}