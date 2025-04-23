import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Customer from "../models/Customer.js";

const configureGoogleStrategy = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.ID_CLIENT,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingCustomer = await Customer.findOne({ googleId: profile.id });
          if (existingCustomer) return done(null, existingCustomer);

          const newCustomer = await Customer.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            profileImg: profile.photos?.[0]?.value || "",
            googleId: profile.id,
            password: "GOOGLE_AUTH",
            dataDiNascita: "2000-01-01",
            gender: "other",
            phoneNumber: "0000000000",
            indirizzoDiCasa: "Login tramite Google"
          });

          done(null, newCustomer);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
};

export default configureGoogleStrategy;
