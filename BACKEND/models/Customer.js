import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, "Formato email non valido"],
  },
  dataDiNascita: {
    type: Date,
    required: true,
  },
  password: {
    type: String,
   
  },
  role: {
    type: String,
    enum: ["customer", "host"],
    default: "customer",
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default : "other",
  },
  profileImg: String,
  googleId: String,
  cloudinaryId: String,
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    maxlength: 15,
  },
  indirizzoDiCasa: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Customer", customerSchema);
