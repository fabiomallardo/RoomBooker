import Struttura from '../models/Struttura.js';
import Customer from '../models/Customer.js';
import { sendEmail } from '../helpers/email.js';
import { cloudinary } from '../helpers/cloudinary.js';
import fetch from 'node-fetch'; 

export const create = async (req, res) => {
  const { name, type, description, address, city, country, pricePerNight } = req.body;
  const { customerId } = req.user;

  if (!name) return res.status(400).json({ error: 'Il campo "name" è richiesto.' });
  if (!req.files?.length) return res.status(400).json({ message: "Almeno una immagine è richiesta" });

  try {
    const fullAddress = `${address}, ${city}, ${country}`;
    const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(fullAddress)}&key=${process.env.REACT_APP_OPENCAGE_API_KEY}`;

    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData?.results?.length) {
      return res.status(400).json({ message: "Indirizzo non valido o non trovato" });
    }

    const { lat, lng } = geoData.results[0].geometry;

    const imageUrls = req.files.map(f => f.path);
    const cloudinaryIds = req.files.map(f => f.filename);

    const struttura = await Struttura.create({
      name,
      type,
      description,
      address,
      city,
      country,
      pricePerNight,
      images: imageUrls,
      cloudinaryIds,
      ownerId: customerId,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
    });

    const customer = await Customer.findById(customerId);
    await sendEmail({
      to: customer.email,
      subject: `🏨 La tua struttura "${struttura.name}" è stata pubblicata!`,
      html: `
        <h2>Complimenti, la tua struttura è stata creata con successo</h2>
        <p><strong>Nome:</strong> ${struttura.name}</p>
        <p><strong>Prezzo per notte:</strong> €${struttura.pricePerNight}</p>
        <p><strong>Indirizzo:</strong> ${struttura.address}, ${struttura.city}, ${struttura.country}</p>
        <p><strong>Posizione:</strong> 
          <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank">Vedi su Google Maps</a>
        </p>`
    });

    res.status(201).json(struttura);
  } catch (error) {
    console.error('❌ Errore creazione struttura:', error);
    res.status(500).json({ message: 'Errore nella creazione della struttura', error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const strutture = await Struttura.find().sort({ createdAt: -1 });
    res.status(200).json(strutture);
  } catch (error) {
    console.error('❌ Errore nel recupero delle strutture:', error);
    res.status(500).json({ message: "Errore nel recupero delle strutture", error: error.message });
  }
};

export const getUserStrutture = async (req, res) => {
  try {
    const strutture = await Struttura.find({ ownerId: req.user.customerId }).sort({ createdAt: -1 });
    res.status(200).json(strutture);
  } catch (error) {
    console.error('❌ Errore nel recupero strutture utente:', error);
    res.status(500).json({ message: "Errore nel recupero delle strutture", error: error.message });
  }
};


export const getById = async (req, res) => {
  try {
    const struttura = await Struttura.findById(req.params.id);
    if (!struttura) return res.status(404).json({ message: "Struttura non trovata" });
    res.status(200).json(struttura);
  } catch (error) {
    console.error('❌ Errore nel recupero struttura:', error);
    res.status(500).json({ message: "Errore nel recupero struttura", error: error.message });
  }
};

export const update = async (req, res) => {
  const { strutturaId } = req.params;
  const { customerId } = req.user;
  const updates = req.body;

  try {
    const struttura = await Struttura.findById(strutturaId);
    if (!struttura) return res.status(404).json({ message: 'Struttura non trovata' });

    if (struttura.ownerId.toString() !== customerId) {
      return res.status(403).json({ message: 'Non autorizzato' });
    }

    Object.assign(struttura, updates);
    await struttura.save();
    res.status(200).json(struttura);
  } catch (error) {
    console.error('❌ Errore modifica struttura:', error);
    res.status(500).json({ message: 'Errore durante modifica struttura', error: error.message });
  }
};

export const deleteStruttura = async (req, res) => {
  const { strutturaId } = req.params;
  const { customerId } = req.user;

  try {
    const struttura = await Struttura.findById(strutturaId);
    if (!struttura) return res.status(404).json({ message: 'Struttura non trovata' });

    if (struttura.ownerId.toString() !== customerId) {
      return res.status(403).json({ message: 'Non sei autorizzato a eliminare questa struttura' });
    }

    for (const publicId of struttura.cloudinaryIds || []) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Errore eliminazione immagine Cloudinary:', err);
      }
    }

    await struttura.deleteOne();
    res.status(200).json({ message: 'Struttura e immagini eliminate con successo' });
  } catch (error) {
    console.error('❌ Errore eliminazione struttura:', error);
    res.status(500).json({ message: 'Errore durante la cancellazione della struttura', error: error.message });
  }
};
export const updateStruttura = async (req, res) => {
  const { strutturaId } = req.params
  const { customerId } = req.user

  try {
    const struttura = await Struttura.findById(strutturaId)
    if (!struttura) return res.status(404).json({ message: "Struttura non trovata" })

    if (struttura.ownerId.toString() !== customerId) {
      return res.status(403).json({ message: "Non autorizzato" })
    }

    // ✅ Se c'è un'immagine, aggiorna
    if (req.file) {
      struttura.images[0] = req.file.path
      struttura.cloudinaryIds[0] = req.file.filename
    
    }

    // ✅ Cast automatico: definisci i tipi per ogni campo
    const fieldTypes = {
      name: 'string',
      description: 'string',
      city: 'string',
      address: 'string',
      country: 'string',
      pricePerNight: 'number',
    }

    // ✅ Aggiorna dinamicamente con cast
    Object.entries(req.body).forEach(([key, value]) => {
      if (fieldTypes[key]) {
        const castedValue =
          fieldTypes[key] === 'number' ? Number(value) :
          fieldTypes[key] === 'boolean' ? value === 'true' :
          value

        struttura[key] = castedValue
       
      }
    })

    await struttura.save()
    res.status(200).json(struttura)
  } catch (err) {
    console.error("❌ Errore aggiornamento struttura:", err)
    res.status(500).json({ message: "Errore aggiornamento struttura", error: err.message })
  }
}



