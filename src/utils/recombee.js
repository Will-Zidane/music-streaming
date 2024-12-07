import { RecombeeClient } from 'recombee-api-client';
import { AddUser, AddItem, RecommendItemsToUser } from 'recombee-api-client/lib/requests';

const client = new RecombeeClient(
  process.env.RECOMBEE_DATABASE_ID,  // Recombee Database ID
  process.env.RECOMBEE_PRIVATE_TOKEN // Recombee Private Token
);

export default client;
