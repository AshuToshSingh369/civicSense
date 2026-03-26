const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // Look for existing user with same email (link accounts)
                const email = profile.emails[0].value;
                user = await User.findOne({ email });

                if (user) {
                    user.googleId = profile.id;
                    // Auto-verify if they used Google
                    user.isVerified = true;
                    if (user.otp) user.otp = undefined;
                    await user.save();
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    name: profile.displayName,
                    email: email,
                    googleId: profile.id,
                    role: 'citizen', // Default role for new signups
                    isVerified: true, // Google accounts are implicitly verified
                });

                return done(null, user);
            } catch (error) {
                console.error('Google Auth Error:', error);
                return done(error, null);
            }
        }
    )
);

// We won't use sessions, but Passport requires these to be defined
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});
