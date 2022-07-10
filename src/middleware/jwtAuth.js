const jwt = require('../utils/jwt');
const cache = require('../utils/cache');

module.exports = async (token) => {
  if (token && token.startsWith('Bearer ')) {
      let auth = token.slice(7, token.length);
      try {
        auth = auth.trim();
          /* ---------------------- Check For Blacklisted Tokens ---------------------- */
          const isBlackListed = await cache.get(auth);
          if (isBlackListed) {
              return false;
          }
          const decoded = jwt.verifyToken(auth);
          return decoded
      } catch (error) { 
          return false
      }
    }
  return false
}