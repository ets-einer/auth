import { logger } from './logger';
import express from 'express';
import cors from 'cors'

const AUTH_PORT = process.env.PORT || 4001;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    return res.status(200).json({ message: "Hello World" })
})

app.listen(AUTH_PORT, () => {
    logger.log(`Server listening on port ${AUTH_PORT}`)
})