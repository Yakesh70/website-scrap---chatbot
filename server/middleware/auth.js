const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

const requireAuth = ClerkExpressWithAuth({
  onError: (error) => {
    console.error('Auth error:', error);
    return { error: 'Authentication failed' };
  }
});

module.exports = { requireAuth };