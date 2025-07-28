import mongoose from "mongoose";

// const PatientSchema = new mongoose.Schema(
//   {
//     fullName: String,
//     birthDate: String,
//     address: String,
//   },
//   { timestamps: true }
// );

const PatientSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    birthDate: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true }
);

export const Patient =
  mongoose.models.Patient || mongoose.model("Patient", PatientSchema);
