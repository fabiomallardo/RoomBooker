import Customer from '../models/Customer.js';
import { cloudinary, upload } from '../helpers/cloudinary.js';


const notFound = (res) => res.status(404).json({ message: "Cliente non trovato" });

export async function readAuthCustomer(req, res) {
  try {
    const customer = await Customer.findById(req.user.customerId).select("-password");

    if (!customer) return res.status(404).json({ message: "Utente non trovato" });

    res.status(200).json({
      customerId: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phoneNumber: customer.phoneNumber,
      indirizzoDiCasa: customer.indirizzoDiCasa,
      profileImg: customer.profileImg,
      gender: customer.gender || "other",
      role: customer.role,
      email: customer.email,
    });
  } catch (error) {
    console.error("❌ Errore readAuthCustomer:", error);
    res.status(500).json({ message: "Errore nel recupero del profilo" });
  }
}

export async function editAuthCustomer(req, res) {
  try {
  

  
    if (req.body.gender) {
      req.body.gender = req.body.gender.trim().toLowerCase();
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "phoneNumber",
      "indirizzoDiCasa",
      "gender"
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    const updated = await Customer.findByIdAndUpdate(
      
      req.user.customerId,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");
    


    if (!updated) return notFound(res);

  

    res.status(200).json({
      customerId: updated._id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phoneNumber: updated.phoneNumber,
      indirizzoDiCasa: updated.indirizzoDiCasa,
      gender: updated.gender || "other",
      email: updated.email,
      role: updated.role,
      profileImg: updated.profileImg,
    });

  } catch (error) {
    console.error("❌ Errore editAuthCustomer:", error);
    res.status(500).json({ message: "Errore durante aggiornamento profilo" });
  }
}

export const editAuthCustomerImage = [
  upload.single("profileImg"),
  async (req, res) => {
    try {
      console.log("📥 PATCH /me/image");
      console.log("🧾 req.file:", req.file);
      console.log("🔐 req.user:", req.user);

      if (!req.file) {
        return res.status(400).json({ message: "Nessuna immagine inviata" });
      }

      const customer = await Customer.findById(req.user.customerId || req.user._id);

      if (!customer) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      if (customer.cloudinaryId) {
        console.log("🧹 Rimuovo vecchia immagine:", customer.cloudinaryId);
        await cloudinary.uploader.destroy(customer.cloudinaryId);
      }

      customer.profileImg = req.file.path;
      customer.cloudinaryId = req.file.filename;
      await customer.save();

      console.log("✅ Profilo aggiornato con immagine");
      return res.status(200).json(customer);
    } catch (err) {
      console.error("❌ Errore update immagine profilo:", err);
      return res.status(500).json({ message: "Errore interno durante upload immagine" });
    }
  },
];


export async function destroyAuthCustomer(req, res) {
  try {
    const customer = await Customer.findByIdAndDelete(req.user.customerId);
    if (!customer) return notFound(res);

    res.status(200).json({ message: "Cliente eliminato con successo" });
  } catch (error) {
    console.error("❌ Errore destroyAuthCustomer:", error);
    res.status(500).json({ message: "Errore durante eliminazione profilo" });
  }
}
