import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token mancante o formato non valido' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET non definito nel .env");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Errore authMiddleware:", err.message);
    return res.status(401).json({ message: 'Token non valido' });
  }
};

export default authMiddleware;
