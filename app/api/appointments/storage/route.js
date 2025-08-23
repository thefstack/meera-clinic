import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.resolve("database/appointments.json");

function loadAppointmentsFromFile() {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading appointments.json:", err);
    return [];
  }
}

function saveAppointmentsToFile(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing appointments.json:", err);
  }
}

// GET → load appointments
export async function GET() {
  const data = loadAppointmentsFromFile();
  return NextResponse.json(data);
}

// POST → save appointments
export async function POST(req) {
  const body = await req.json();
  saveAppointmentsToFile(body);
  return NextResponse.json({ success: true });
}
