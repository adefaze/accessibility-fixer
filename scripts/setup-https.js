#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const { execSync } = require('node:child_process')

const CERT_DIR = path.resolve(process.cwd(), 'dev-certs')
const KEY_PATH = path.join(CERT_DIR, 'localhost.key')
const CERT_PATH = path.join(CERT_DIR, 'localhost.crt')

function ensureCertDir() {
  if (!fs.existsSync(CERT_DIR)) {
    fs.mkdirSync(CERT_DIR, { recursive: true })
  }
}

function generateCertificate() {
  const command = [
    'openssl req -x509 -nodes -sha256 -days 3650 -newkey rsa:2048',
    `-keyout "${KEY_PATH}"`,
    `-out "${CERT_PATH}"`,
    '-subj "/CN=localhost"',
    '-addext "subjectAltName=DNS:localhost,IP:127.0.0.1"'
  ].join(' ')

  execSync(command, { stdio: 'inherit' })
}

try {
  ensureCertDir()
  generateCertificate()
  console.log(`\nLocal HTTPS certificate created:\n  Key:  ${KEY_PATH}\n  Cert: ${CERT_PATH}`)
} catch (err) {
  console.error('\nFailed to create HTTPS certificate via OpenSSL.')
  console.error('Ensure OpenSSL is installed and available on your PATH.')
  console.error(err.message)
  process.exit(1)
}
