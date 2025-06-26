import express from 'express'
import path from 'path'
import {fileURLToPath, pathToFileURL} from 'url'
import {cors} from './middleware/cors.js'

import { handleError } from './middleware/handleError.js'
import {notFound} from './middleware/notFound.js'


const app = express()
const PORT = process.env.PORT || 3000


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/cause-error', (req, res) => {
  // Simulate an unexpected server error
  throw new Error('Something went terribly wrong!');
});

// Serve Bootstrap CSS/JS from node_modules
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

app.use(notFound)
app.use(handleError)


app.listen(PORT, ()=> {
    console.log(`Server Ready at PORT ${PORT}`)
})