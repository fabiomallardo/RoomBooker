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
      const debug = {
        file: req.file,
        body: req.body,
        user: req.user
      }
  
      const userId = req?.user?._id || req?.user?.customerId
  
      if (!userId) {
        debug.reason = 'Token mancante o malformato'
        return res.status(401).json({ message: "Token non valido", debug })
      }
  
      const customer = await Customer.findById(userId)
      if (!customer) {
        debug.reason = 'Utente non trovato nel DB'
        return res.status(404).json({ message: "Utente non trovato", debug })
      }
  
      if (!req.file || !req.file.path) {
        debug.reason = 'File non ricevuto o path nullo'
        return res.status(400).json({ message: "File immagine mancante o non valido", debug })
      }
  
      if (customer.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(customer.cloudinaryId)
        } catch (e) {
          debug.cloudinaryDestroyError = e.message
        }
      }
  
      const newImg = req.file.path
      const cloudId = req.file.filename || req.file.public_id || req.file.originalname
  
      if (!newImg || !cloudId) {
        debug.reason = 'Cloudinary ID o path mancante'
        return res.status(500).json({ message: "Errore upload immagine", debug })
      }
  
      customer.profileImg = newImg
      customer.cloudinaryId = cloudId
  
      await customer.save()
  
      return res.status(200).json({ message: "Upload riuscito", customer })
  
    } catch (err) {
      console.error("❌ Errore interno:", err)
      return res.status(500).json({ message: "Errore interno server", error: err.message })
    }
  }
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
