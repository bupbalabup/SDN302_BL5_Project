import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Kiểm tra xem user đã tồn tại chưa
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Nếu user đã tồn tại, cho đăng nhập luôn
          return done(null, user);
        }

        // Nếu chưa tồn tại, tạo user mới
        const hashedPassword = await bcrypt.hash("Ab@12345", 10);
        const newUser = await User.create({
          googleId: profile.id,
          fullname: profile.displayName,
          email: profile.emails[0].value,
          avatarURL: profile.photos?.[0]?.value || null,
          emailVerified: profile.emails?.[0]?.verified ?? true,
          password: hashedPassword,
          provider: "google",
          status: "active",
        });

        return done(null, newUser);
      } catch (err) {
        console.error("Google auth error:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
