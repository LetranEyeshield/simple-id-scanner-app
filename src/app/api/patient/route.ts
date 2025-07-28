import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import { Patient } from "../../models/Patient";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await connectDB();
    const newPatient = await Patient.create(body);

    return NextResponse.json({ success: true, data: newPatient });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
