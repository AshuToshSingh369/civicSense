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
                
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                
                const email = profile.emails[0].value;
                user = await User.findOne({ email });

                if (user) {
                    user.googleId = profile.id;
                    
                    user.isVerified = true;
                    if (user.otp) user.otp = undefined;
                    await user.save();
                    return done(null, user);
                }

                
                user = await User.create({
                    name: profile.displayName,
                    email: email,
                    googleId: profile.id,
                    role: 'citizen', 
                    isVerified: true, 
                });

                return done(null, user);
            } catch (error) {
                console.error('Google Auth Error:', error);
                return done(error, null);
            }
        }
    )
);


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});
