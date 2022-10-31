export default () => ({
  port: parseInt(process.env.BACKEND_PORT, 10) || 3000,

  ft: {
    UID: process.env.FT_UID,
    SECRET: process.env.FT_SECRET,
    REDIRECT_URL: process.env.FT_REDIRECT_URL,
  },
  jwt: {
    SECRET: process.env.JWT_SECRET,
    EXPIRATION_TIME: parseInt(process.env.JWT_EXPIRATION_TIME, 10) || 3600,
  },
  cookie: {
    SECRET: process.env.COOKIE_SECRET,
  },
});
