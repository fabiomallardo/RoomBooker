import jwt from 'jsonwebtoken';

export const generateJwt = (payload, expiresIn = '5d') => {
  return new Promise((resolve, reject) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) return reject(new Error("JWT_SECRET non definito nel .env"));

    jwt.sign(payload, secret, { expiresIn }, (err, token) => {
      if (err) reject(err);
      else resolve(token);
    });
  });
};
