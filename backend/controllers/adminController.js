import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Signup from "../models/Signup.js";
import sendEmail from "../utils/sendEmail.js";



export const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments({ isVerified: true });
    const pendingApprovals = await Doctor.countDocuments({ isVerified: false });

    const specializationData = await Doctor.aggregate([
      { $match: { isVerified: true } },
      {
        $group: {
          _id: "$specialization",
          count: { $sum: 1 }
        }
      }
    ]);

    const specializationStats = specializationData.map(item => ({
      name: item._id || "Not Specified",
      value: item.count
    }));

    const registrationData = await Signup.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          patients: {
            $sum: { $cond: [{ $eq: ["$role", "patient"] }, 1, 0] }
          },
          doctors: {
            $sum: { $cond: [{ $eq: ["$role", "doctor"] }, 1, 0] }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const registrationStats = registrationData.map(item => ({
      name: `Month ${item._id}`,
      patients: item.patients,
      doctors: item.doctors
    }));

    res.json({
      totalPatients,
      totalDoctors,
      pendingApprovals,
      specializationStats,
      registrationStats
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const patients = await Patient.find()
      .select("name email createdAt")  // ✅ only required fields
      .sort({ createdAt: -1 });  // ✅ newest first

    res.status(200).json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* GET ALL DOCTORS */
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* APPROVE DOCTOR */
export const approveDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      {
        isVerified: true,
        rejectionReason: "",
      },
      { returnDocument: "after" }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // ✅ SEND EMAIL
    await sendEmail({
  email: doctor.email,  // ✅ NOT "to"
  subject: "Telemed Account Approved ✅",
  message: `Hello ${doctor.name},

Your profile has been approved.

You can now login to Telemed.

Thank you!
Telemed Team`
});

    return res.status(200).json(doctor);

  } catch (error) {
    console.error("Approve Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* REJECT DOCTOR */

export const rejectDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason required" });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      {
        isVerified: false,
        rejectionReason: reason,
      },
      { returnDocument: "after" }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // ✅ SEND EMAIL WITH REASON
    await sendEmail({
  email: doctor.email,  // ✅ NOT "to"
  subject: "Telemed Profile Rejected ❌",
  message: `Hello ${doctor.name},

Your profile has been rejected.

Reason: ${reason}

Please update your details and try again.

Telemed Team`
});
    return res.status(200).json(doctor);

  } catch (error) {
    console.error("Reject Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* DELETE DOCTOR */
export const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findByIdAndDelete(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.status(200).json({ message: "Doctor deleted" });

  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};