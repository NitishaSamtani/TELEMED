import mongoose from "mongoose";

const signupSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },

    email: { 
      type: String, 
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          return (
            email.endsWith("@gmail.com") ||
            email.endsWith("@yahoo.com") ||
            email.endsWith("@outlook.com")
          );
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },

    password: { 
      type: String, 
      required: true 
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],   // ✅ admin added
      required: true,
    },
  },
  { timestamps: true }
);

// Explicit collection name: users
export default mongoose.model("Signup", signupSchema, "users");