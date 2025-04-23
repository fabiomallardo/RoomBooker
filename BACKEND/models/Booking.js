
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  strutturaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Struttura",
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
