export const environment = {
  production: true,
  port: process.env.PORT || 3004,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/cleverly',
};