import { logger } from './logger';
import express from 'express';
import cors from 'cors'
import { createClient } from 'redis';
import { z } from 'zod';
import { prisma } from './lib/prisma';
import crypto from 'crypto'
import cookieParser from 'cookie-parser'

const AUTH_PORT = process.env.PORT || 4001;

const app = express();
const redis = createClient({
    url: process.env.REDIS_URL ||'redis://:eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81@127.0.0.1:6379'
})


async function connectRedis() {
  await redis.connect()
}

connectRedis()

redis.on("error", (err) => logger.error(`Redis Client Error: ${err}`))

app.use(cors());
app.use(express.json());
app.use(cookieParser())

app.get('/', async (req, res) => {
  await redis.set('testkey', 12)
  await redis.set('testkey2', "12")
  return res.status(200).json({ message: "Hello World" })
})

app.get('/me', async (req, res) => {
  const sessionCookie = z.object({
    sessionId: z.string()
  })

  const { sessionId } = sessionCookie.parse(req.cookies)

  try {
    const userId = await redis.get(sessionId)

    if (!userId) return res.status(404).json({ message: "User from your session does not exists" })

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })
    return res.status(200).json({ message: "User retrieved successfully", user })
  } catch (error) {
    return res.status(500).json({ message: "Could not retrieve user from session"})
  }
  
})

app.post('/signup', async (req, res) => {
  const signUpBody = z.object({
    email: z.string().email(),
    password: z.string()
  })

  const { email, password } = signUpBody.parse(req.body);

  const user = await prisma.user.findFirst({
    where: { email }
  })

  if (user) return res.status(400).json({ message: "User with that email already exists" })

  // const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: password
      }
    })
    return res.status(200).json({ message: "User created", user })
  } catch (error) {
    return res.status(500).json({ message: "User could not be created", error })
  }
})

app.post('/signin', async (req, res) => {
  const signInBody = z.object({
    email: z.string().email(),
    password: z.string()
  })

  const { email, password } = signInBody.parse(req.body);

  const user = await prisma.user.findFirst({
    where: { email }
  })

  if (!user) return res.status(404).json({ message: "This user does not exists" })

  if (user.passwordHash !== password) return res.status(404).json({ message: "Email or password wrong" })

  const sessionId = crypto.randomBytes(16).toString('hex')

  try {
    await redis.set(sessionId, user.id)
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      maxAge: 1000 * 60 *30,
      signed: false
    })
    return res.status(200).json({ message: "User session created succesfully" })
  } catch (error) {
    return res.status(500).json({ message: "Could not create user session" })
  }
})

app.listen(AUTH_PORT, () => {
  logger.log(`Server listening on port ${AUTH_PORT}`)
})

async function disconnectRedis() {
  await redis.disconnect()
}
