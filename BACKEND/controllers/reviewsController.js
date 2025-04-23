import Review from '../models/Review.js';
import Struttura from '../models/Struttura.js';

export const create = async (req, res) => {
  const { strutturaId } = req.params;
  const { rating, comment } = req.body;
  const { customerId } = req.user;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating deve essere tra 1 e 5" });
  }

  if (!comment?.trim()) {
    return res.status(400).json({ message: "Il commento è obbligatorio" });
  }

  try {
    const struttura = await Struttura.findById(strutturaId);
    if (!struttura) return res.status(404).json({ message: 'Struttura non trovata' });

    const review = new Review({ strutturaId, customerId, rating, comment });
    await review.save();

    await review.populate('customerId', 'firstName lastName profileImg');

  
    const reviews = await Review.find({ strutturaId });
    const media = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    struttura.rating = parseFloat(media.toFixed(1));
    await struttura.save();

    res.status(201).json(review);
  } catch (error) {
    console.error("❌ Errore recensione:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Hai già recensito questa struttura" });
    }
    res.status(500).json({ message: 'Errore durante l\'aggiunta della recensione' });
  }
};


export const getByStruttura = async (req, res) => {
  const { strutturaId } = req.params;

  try {
    const reviews = await Review.find({ strutturaId }).populate('customerId', 'firstName lastName profileImg');
    res.status(200).json(reviews);
  } catch (error) {
    console.error("❌ Errore recupero recensioni:", error);
    res.status(500).json({ message: 'Errore durante il recupero delle recensioni' });
  }
};


export const destroy = async (req, res) => {
  const { id } = req.params;
  const { customerId } = req.user;

  try {
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Recensione non trovata" });

    if (review.customerId.toString() !== customerId) {
      return res.status(403).json({ message: "Non sei autorizzato a eliminarla" });
    }

    await review.deleteOne();
    res.status(200).json({ message: "Recensione eliminata" });
  } catch (err) {
    res.status(500).json({ message: "Errore interno" });
  }
};

export const update = async (req, res) => {
  const { id } = req.params;
  const { customerId } = req.user;
  const { rating, comment } = req.body;

  try {
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Recensione non trovata" });

    if (review.customerId.toString() !== customerId) {
      return res.status(403).json({ message: "Non sei autorizzato a modificarla" });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    const updated = await review.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Errore durante l'aggiornamento" });
  }
};

