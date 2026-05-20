import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './prisma';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const MicrosoftStrategy = require('passport-microsoft').Strategy;

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${BACKEND_URL}/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('Email não retornado pelo Google'));

        const user = await prisma.user.upsert({
          where: { email },
          update: {
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value ?? undefined,
          },
          create: {
            email,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value ?? undefined,
            provider: 'google',
          },
        });

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      callbackURL: `${BACKEND_URL}/auth/microsoft/callback`,
      tenant: process.env.MICROSOFT_TENANT_ID || 'common',
      scope: ['user.read'],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: {
        id: string;
        displayName: string;
        emails?: { value: string }[];
        photos?: { value: string }[];
      },
      done: (err: Error | null, user?: unknown) => void
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('Email não retornado pela Microsoft'));

        const user = await prisma.user.upsert({
          where: { email },
          update: {
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value ?? undefined,
          },
          create: {
            email,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value ?? undefined,
            provider: 'microsoft',
          },
        });

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as { id: string }).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
