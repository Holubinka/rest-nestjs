import { config } from 'dotenv';

config();

const constants = {
  dbUrl: process.env.DATABASE_URL,
  authSecret: process.env.AUTH_SECRET,
  mimetype: ['image/jpeg', 'image/png'],
  imagesFolder: 'posts',
  imagesPrivate: 'private',
};

export default constants;
