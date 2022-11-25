export default () => ({
  port: parseInt(process.env.BACKEND_PORT, 10) || 3000,

  ft: {
    uid: process.env.FT_UID,
    secret: process.env.FT_SECRET,
    redirect_url: process.env.FT_REDIRECT_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiration_time_long:
      parseInt(process.env.JWT_EXPIRATION_TIME_LONG, 10) || 86400,
    expiration_time_short:
      parseInt(process.env.JWT_EXPIRATION_TIME_SHORT, 10) || 180,
  },

  cookie: {
    secret: process.env.COOKIE_SECRET,
  },

  mail: {
    host: process.env.MAIL_HOST,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM,
  },

  twofactor: {
    expiration_time: parseInt(process.env.TWOFACTOR_EXPIRATION_TIME, 10) || 180,
  },

  database: {
    postgres_host: process.env.POSTGRES_HOST,
    postgres_port: process.env.POSTGRES_PORT,
    postgres_user: process.env.POSTGRES_USER,
    postgres_password: process.env.POSTGRES_PASSWORD,
    postgres_db_name: process.env.POSTGRES_DB_NAME,
  },
});
