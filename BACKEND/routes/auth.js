import { Router } from "express";
import passport from "passport";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import Customer from "../models/Customer.js";
import { generateJwt } from "../helpers/token.js";
import bcrypt from "bcrypt";
import configureGoogleStrategy from "../strategies/googleStrategy.js";

dotenv.config();
const router = Router();

const client = new OAuth2Client(process.env.ID_CLIENT);
configureGoogleStrategy(passport);

// OAuth con Google
router.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign(
      { customerId: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(`http://localhost:5173/login/success?token=${token}`);
  }
);


router.post("/auth/google/token", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      console.warn("❌ Token mancante nella richiesta");
      return res.status(400).json({ message: "Token mancante" });
    }


    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.ID_CLIENT,
    });
    
    const payload = ticket.getPayload();
    
    const { email, given_name, family_name, picture } = payload;

    let customer = await Customer.findOne({ email });
    if (!customer) {
      customer = await Customer.create({
        firstName: given_name,
        lastName: family_name,
        email,
        profileImg: picture,
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
        role: "customer",
        gender: "other", //DA AGGIORNARE
        phoneNumber: "00000000", //DA AGGIORNARE
        dataDiNascita: "2000-01-01", //DA AGGIORNARE
        indirizzoDiCasa: "N/D", //DA AGGIORNARE
      });

    }

    const token = await generateJwt({ customerId: customer._id });

    return res.status(200).json({
      message: "Login con Google completato",
      token,
      customer: {
        id: customer._id,
        firstName: customer.firstName,
        gender: customer.gender,
        email: customer.email,
        role: customer.role,
        profileImg: customer.profileImg,
      },
    });
  } catch (err) {
    console.error("❌ Errore login Google One Tap:", err);
    res.status(401).json({ message: "Token Google non valido", error: err.message });
  }
});

export default router;
