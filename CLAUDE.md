# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DocuChain is a paid file integrity and timestamping service. The core value proposition: for €1, a user can prove that a specific file existed at a specific point in time, by storing its SHA-256 hash on the Ethereum blockchain. The blockchain record is immutable and publicly verifiable.

**Intended user flow:**
1. User drops a file → SHA-256 hash is computed client-side
2. User pays €1 via Stripe → a credit is added to their account
3. Hash is written to the `FileStorage` smart contract on Sepolia, creating a permanent timestamped record
4. User can create an account (triggered by the Stripe payment) to track all their registered files
5. Account holders can top up a credit wallet for future uploads without going through Stripe each time

**Anyone** can verify a file for free by dropping it into the checker — no account needed. The fee only applies to registering a new hash.

The repo contains two separate projects:
- **Root**: Hardhat project (Solidity smart contracts + tests + deployment)
- **`frontend/`**: Next.js 14 app (App Router)

---

## Commands

### Smart Contract (run from repo root)

```bash
npm run compile          # Compile Solidity contracts
npm test                 # Run Hardhat tests (Mocha/Chai)
npm run deploy-sepolia   # Deploy via Hardhat Ignition to Sepolia
```

Secrets for the Hardhat CLI are managed with Hardhat variables (not `.env`):
```bash
npx hardhat vars set INFURA_API_KEY <value>
npx hardhat vars set SEPOLIA_PRIVATE_KEY <value>
npx hardhat vars set ETHERSCAN_API_KEY <value>
```

### Frontend (run from `frontend/`)

```bash
npm run dev     # Start dev server (localhost:3000)
npm run build   # Production build
npm run lint    # ESLint
```

---

## Architecture

### Smart Contract (`contracts/FileManager.sol`)

Single contract `FileStorage`:
- Stores a mapping `files[sha256Hash] => File { userId }`.
- Only the `manager` address (deployer) can call `storeFile`.
- Emits `FileAdded(fileHash, blockNumber, timestamp)` on each store.

The Ignition deployment module (`ignition/modules/FileManager.js`) deploys `FileStorage` only. The `FileManagerFactory` contract referenced in tests does not match the current `FileManager.sol` — the test file (`test/FileManager.js`) tests a factory pattern that is no longer the deployed contract.

### Frontend (`frontend/src/`)

**App Router structure:**
- `app/(site)/` — user-facing pages (layout with header/footer)
  - `files/` — lists user's registered files; checks each against the blockchain on load
  - `blog/`, `stripe/` — other pages
- `app/api/` — API routes
  - `auth/[...nextauth]/` — NextAuth credentials handler
  - `files/` — server actions for DB file lookups (`checkIfFileExistsOnDatabase`, `getFileHashes`)
  - `register/`, `stripe/`, `stripeevents/`, `test/`
- `app/components/` — shared components
  - `FileChecker/` — drag-and-drop file verifier (client-side hashing + DB lookup)
  - `FileCard.jsx` — renders one file row/card with live blockchain status
  - `layout/` — `HeaderMenu`, `Footer`, `HomePageHeading`

**Key files:**
- `app/actions.js` — server actions for `getFiles`, `storeFile`, `updateFile` (Postgres)
- `app/(site)/files/actions.js` — blockchain reads via ethers.js + Infura; `checkIfFileExistsOnBlockchain`, `checkCreditForFileUpload`
- `app/hash.js` — server-side SHA-256 hashing using Node `crypto` stream
- `instrumentation.js` — runs on server startup; calls `/api/stripeevents` to start the Stripe event listener
- `middleware.js` — NextAuth middleware protecting `/files*` and `/api/*` (except `/api/register`, `/api/login`, `/api/stripe`, `/api/test`)

**Data flow for file registration:**
1. User picks a file → client computes SHA-256 (in `FileChecker`) or server computes it (`hash.js`)
2. Hash stored in Postgres `file` table via `storeFile` action (transaction_hash initially `'replace_me'`)
3. Hash sent to `FileStorage` contract on Sepolia via a signed wallet transaction
4. `updateFile` called to write the returned `transaction_hash` back to Postgres

**Dual storage:** Every file record lives in both Postgres (`file` table) and on-chain. `FileCard` cross-checks against the blockchain on mount and shows green/red status.

### Database Schema (Vercel Postgres / Neon)

Inferred from SQL queries:
- `user_account`: `user_account_id`, `email`, `password`, `credit`, `created` (bool)
- `file`: `name`, `hash`, `transaction_hash`, `id_user`, `lastmodified`

### Auth

NextAuth with `CredentialsProvider` (email + bcrypt password), JWT sessions. A user row must exist with `created = true` before login is possible — rows are pre-created by Stripe webhook events; the user then calls `/api/register` to set their password.

### Frontend Environment Variables (`frontend/.env`)

Required variables:
- `PRIVATE_KEY` / `SEPOLIA_PRIVATE_KEY` — wallet private key for signing blockchain transactions
- `INFURA_API_KEY` — Infura project key for Sepolia RPC
- `FILES_STORAGE_CONTRACT_ADDRESS` — deployed `FileStorage` contract on Sepolia
- `NEXT_PUBLIC_BASE_URL` — base URL for internal fetch calls
- `NEXTAUTH_URL` / `NEXTAUTH_SECRET` — NextAuth config
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — Stripe
- `POSTGRES_URL` and related `POSTGRES_*` vars — Neon database connection

### Path Alias

`@/` maps to `frontend/src/` (configured in `jsconfig.json`). Use `@/contracts/FileStorage` to import the contract ABI JSON.
