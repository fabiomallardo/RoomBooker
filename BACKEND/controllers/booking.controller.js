import Booking from "../models/Booking.js";
import Struttura from "../models/Struttura.js";

// NUOVA PRENOTAZIONE
export const createBooking = async (req, res) => {
  const { strutturaId } = req.params;
  const { checkIn, checkOut, guests } = req.body;
  const { customerId } = req.user;

  if (!checkIn || !checkOut || !guests) {
    return res.status(400).json({ message: "Tutti i campi sono obbligatori" });
  }

  if (new Date(checkIn) >= new Date(checkOut)) {
    return res.status(400).json({ message: "Check-in deve essere prima del check-out" });
  }

  try {
    const struttura = await Struttura.findById(strutturaId);
    if (!struttura) return res.status(404).json({ message: "Struttura non trovata" });

    const overlapping = await Booking.findOne({
      strutturaId,
      $or: [
        { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
      ]
    });

    if (overlapping) {
      return res.status(409).json({ message: "Struttura già prenotata in quelle date" });
    }

    const booking = await Booking.create({
      strutturaId,
      customerId,
      checkIn,
      checkOut,
      guests
    });

    res.status(201).json({ message: "✅ Prenotazione salvata", booking });
  } catch (error) {
    console.error("❌ Errore salvataggio prenotazione:", error);
    res.status(500).json({ message: "Errore interno", error: error.message });
  }
};

// PRENOTAZIONI DELL'UTENTE LOGGATO
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.customerId })
      .populate("strutturaId", "name city address images")
      .sort({ checkIn: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    console.error("❌ Errore getMyBookings:", err);
    res.status(500).json({ message: "Errore nel recupero delle prenotazioni" });
  }
};

// PRENOTAZIONI EFFETTUATE SULLA STRUTTURA
export const getStrutturaBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ strutturaId: req.params.strutturaId })
      .populate("customerId", "firstName lastName profileImg")
      .sort({ checkIn: 1 });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Errore nel recupero delle prenotazioni struttura" });
  }
};

// ELIMINA PRENOTAZIONE DELL'UTENTE 
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Prenotazione non trovata" });

    const isOwner = booking.customerId.toString() === req.user.customerId;

    if (!isOwner) {
      return res.status(403).json({ message: "Non sei autorizzato a cancellare questa prenotazione" });
    }

    await booking.deleteOne();
    res.status(200).json({ message: "Prenotazione cancellata" });
  } catch (err) {
    console.error("Errore eliminazione:", err);
    res.status(500).json({ message: "Errore del server" });
  }
};

