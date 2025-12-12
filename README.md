# Accessibility Audit & Fixer — Framer Plugin (starter)

Author: Abiodun Adefila

Scaffolded starter for the Accessibility Audit & Fixer plugin.

Quick start:

```bash
cd "accessibility-plugin"
npm install
npm run setup:https  # generates dev TLS certs (required for Framer)
npm run dev
```

Files added: source scaffold in `src/` including a basic scan UI and contrast util.

Next: implement scanners, fixers, and integrate Anthropic/Claude per spec.

## Local HTTPS

Framer loads plugins inside an HTTPS iframe and refuses insecure origins, so the Vite dev server must present a TLS certificate for `127.0.0.1`. Run `npm run setup:https` once to generate a self-signed certificate (stored in `dev-certs/`). If you ever delete the folder or the certificate expires, rerun the script. On macOS you can add the generated certificate to your Keychain and mark it as trusted to avoid browser warnings.
