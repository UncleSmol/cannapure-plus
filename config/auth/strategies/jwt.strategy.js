/**
 * JWT Strategy Configuration for Passport.js
 * This setup validates JWT tokens for protected routes
 */

const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const db = require('../../database');
const authConfig = require('../auth.config');

/**
 * Configure options for JWT Strategy
 */
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: authConfig.jwt.secret,
  passReqToCallback: true,
};

/**
 * Initialize JWT Strategy
 */
module.exports = () => {
  passport.use(
    new JwtStrategy(options, async (req, jwtPayload, done) => {
      try {
        // Check if token has expired
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (jwtPayload.exp < currentTimestamp) {
          return done(null, false, { message: 'Token expired' });
        }

        // Fetch user by ID from the database
        db.query(
          'SELECT id, id_number, first_name, surname, email, phone, cp_number, account_status, membership_tier, membership_status FROM users WHERE id = ?',
          [jwtPayload.sub],
          async (err, results) => {
            if (err) {
              console.error('Database error in JWT strategy:', err);
              return done(err, false);
            }

            if (!results || results.length === 0) {
              return done(null, false, { message: 'User not found' });
            }

            const user = results[0];

            // Check if user account is active
            if (user.account_status !== 'ACTIVE') {
              return done(null, false, { message: 'Account is not active' });
            }

            // Verify if session is valid in the database
            db.query(
              'SELECT id FROM user_sessions WHERE user_id = ? AND session_token = ? AND is_valid = 1 AND expires_at > NOW()',
              [jwtPayload.sub, jwtPayload.sessionId],
              (err, sessionResults) => {
                if (err) {
                  console.error('Session validation error:', err);
                  return done(err, false);
                }

                if (!sessionResults || sessionResults.length === 0) {
                  return done(null, false, { message: 'Invalid session' });
                }

                // If everything is valid, return the user
                return done(null, user);
              }
            );
          }
        );
      } catch (error) {
        console.error('Error in JWT strategy:', error);
        return done(error, false);
      }
    })
  );
};