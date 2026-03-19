import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    startTime: String,
    endTime: String,
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    day: String,
    slots: [slotSchema],
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Signup",
      required: true,
      unique: true,
    },

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    specialization: { type: String, required: true },

    qualification: { type: String },
    experience: { type: Number },
    bio: { type: String },
    phone: { type: String },
    languagesSpoken: [{ type: String }],

    availability: { type: [availabilitySchema], default: [] },
    breakTime: {
      startTime: String,
      endTime: String,
    },

    profilePhoto: { type: String },
    medicalLicense: { type: String },
    identityProof: { type: String },

    isVerified: { type: Boolean, default: false },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema, "doctors");