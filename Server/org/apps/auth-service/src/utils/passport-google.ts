import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '@packages/libs/prisma';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:6001/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email provided by Google'));
        }

        let user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
          // Create new user
          user = await prisma.users.create({
            data: {
              name: profile.displayName,
              email,
              provider: 'google',
            },
          });
        } else {
          // Update provider if not set
          if (!user.provider) {
            user = await prisma.users.update({
              where: { email },
              data: { provider: 'google' },
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.users.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});
