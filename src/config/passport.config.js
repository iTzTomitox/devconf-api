import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { sessionsService } from '../services/sessions.service.js';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { config } from './config.js';

const COOKIE_NAME = 'currentUser';

const registerStrategy = new LocalStrategy(
  { usernameField: 'email', passReqToCallback: true },
  async (req, email, password, done) => {
    try {
      const { first_name, last_name } = req.body;

      const user = await sessionsService.register({
        first_name,
        last_name,
        email,
        password,
      });
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
);

const loginStrategy = new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
    const user = await sessionsService.validateCredentials({ email, password });
    return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
);

const cookieExtractor = (req) => req?.cookies?.[COOKIE_NAME] ?? null;

const currentStrategy = new JwtStrategy(
  {
    jwtFromRequest: cookieExtractor,
    secretOrKey: config.jwtSecret,
  },
  (payload, done) => {
    return done(null, {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });
  }
);

export const initializePassport = () => {
  passport.use('register', registerStrategy);
  passport.use('login', loginStrategy);
  passport.use('current', currentStrategy);
};

export default passport;