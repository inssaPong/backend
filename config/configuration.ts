export default () => ({
  port: parseInt(process.env.BACKEND_PORT, 10) || 3000,

  ft: {
    uid: process.env.FT_UID,
    secret: process.env.FT_SECRET,
    redirect_url: process.env.FT_REDIRECT_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration_time: parseInt(process.env.JWT_EXPIRATION_TIME, 10) || 3600,
  },
  cookie: {
    secret: process.env.COOKIE_SECRET,
  },

  database: {
    postgres_host: process.env.POSTGRES_HOST,
    postgres_port: process.env.POSTGRES_PORT,
    postgres_user: process.env.POSTGRES_USER,
    postgres_password: process.env.POSTGRES_PASSWORD,
    postgres_db_name: process.env.POSTGRES_DB_NAME,
  },
});
