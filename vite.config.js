import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const KEY_PATH = path.resolve(rootDir, 'dev-certs/localhost.key')
const CERT_PATH = path.resolve(rootDir, 'dev-certs/localhost.crt')

function ensureHttpsConfig() {
  if (!fs.existsSync(KEY_PATH) || !fs.existsSync(CERT_PATH)) {
    throw new Error(
      `HTTPS certificate not found. Expected ${KEY_PATH} and ${CERT_PATH}.` +
        ' Run `npm run setup:https` to regenerate the dev certificate.'
    )
  }

  return {
    key: fs.readFileSync(KEY_PATH),
    cert: fs.readFileSync(CERT_PATH),
    minVersion: 'TLSv1.2',
    allowHTTP1: true
  }
}

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
    https: ensureHttpsConfig(),
    cors: {
      origin: ['https://framer.com', 'https://www.framer.com'],
      methods: ['GET', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  }
})
