// config/session.js
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from './db.js';

export default session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: 'sessions'
  }),
  cookie: { maxAge: 1000 * 60 * 60 }
});
