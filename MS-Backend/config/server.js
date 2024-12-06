module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 1337,
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
