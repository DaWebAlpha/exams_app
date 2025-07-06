import express from 'express'
import path from 'path'
import {fileURLToPath, pathToFileURL} from 'url'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import router from './routes/pageRoutes.js'
import { setupAuth } from './authentication/auth.js';
import session from 'express-session'
import paymentRoutes from './routes/paymentRoutes.js';
import sessionConfig from './config/session.js';
import resetRouter from './routes/resetRoutes.js';




/* Middleware */
import { cors } from './middleware/cors.js';
import { handleError } from './middleware/handleError.js';
import { notFound } from './middleware/notFound.js';
import methodOverride from 'method-override';



const app = express()
const PORT = process.env.PORT || 3000



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
})); */

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(express.static('public'));

app.use(sessionConfig);
setupAuth(app); 

// Serve Bootstrap CSS/JS from node_modules
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use(paymentRoutes);
app.use(resetRouter)


app.get('/cause-error', (req, res) => {
  throw new Error('Something went terribly wrong!');
});

app.use('/', router)

app.use(notFound)
app.use(handleError)


app.listen(PORT, ()=> {
    console.log(`Server Ready at PORT ${PORT}`)
})