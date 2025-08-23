// app/api/appointments/route.js
import { NextResponse } from "next/server";
import {
  bookAppointment,
  checkAppointment,
  getDoctorAvailability,
  getNextAvailableTime,
  getDoctors,
  getClinicInfo,
  getDoctorDetails
} from "@/lib/tools/functions.js";

// POST = book appointment
export async function POST(req) {
  try {
    const body = await req.json();
    const result = await bookAppointment(body);

    const response = {
      data: Array.isArray(result)
        ? result
        : result && typeof result === "object"
          ? [result]
          : [],
      error: result?.error || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("POST /appointments error:", error);
    return NextResponse.json(
      { data: [], error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET = check/query appointments
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const action = searchParams.get("action");
    const doctorId = searchParams.get("doctorId");
    const date = searchParams.get("date");
    const specialty = searchParams.get("specialty");
    const appointmentId = searchParams.get("appointmentId");
    const patientName = searchParams.get("patientName");
    const infoType = searchParams.get("infoType");

    let result = {};

    switch (action) {
      case "getDoctors":
        result = await getDoctors({ specialty });
        break;
      case "getDoctorAvailability":
        result = await getDoctorAvailability({ doctorId, date });
        break;
      case "getNextAvailableTime":
        result = await getNextAvailableTime({ doctorId, date });
        break;
      case "checkAppointment":
        result = await checkAppointment({ patientName, appointmentId });
        break;
      case "getClinicInfo":
        result = await getClinicInfo({ infoType });
        break;
      case "getDoctorDetails":
        result = await getDoctorDetails({ doctorId });
        break;
      default:
        result = { error: "Unknown action" };
    }

    const response = {
      data: Array.isArray(result)
        ? result
        : result && typeof result === "object"
          ? [result]
          : [],
      error: result?.error || null,
    };

    console.log("GET /appointments response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /appointments error:", error);
    return NextResponse.json(
      { data: [], error: "Internal server error" },
      { status: 500 }
    );
  }
}
