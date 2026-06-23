# PriceGate

[![Test Contracts](https://github.com/Adityarust/Pricegate/actions/workflows/test.yml/badge.svg)](https://github.com/Adityarust/Pricegate/actions/workflows/test.yml)

> Lock funds. Set conditions. Let the contract decide.

PriceGate is a Stellar escrow dApp that locks XLM and releases it when a price condition is met.

Live demo: https://pricegate-six.vercel.app

## Deployed Testnet Contracts

- Oracle contract: `CBABRFADXDYNVIUEUBAQJUS4S5OEFHP2ZTZF7TFJH5A5DVQAH5JEER7M`
- Escrow contract: `CDRT2FH2LNJHHM5JVWHL5QUJOG3Z7WVEBE7EEUXNL7N65XEMNAMV4WEB`
- Oracle deploy tx: `a16be60df401a5ed61f0e97cc45ee41dea14bcfe74137f530a554e4f2f77e7e7`
- Escrow deploy tx: `5e57eede8bcc353c3f3665b1a001d6450c9433d378efa43fc857cd2e11f447f7`

## What It Does

- Creates a non-custodial escrow on Stellar Testnet.
- Uses a live Reflector price feed for XLM/USD.
- Shows only the escrows created by the connected wallet in the UI.
- Exposes the on-chain record in Stellar Explorer for verification.

## Architecture

PriceGate is organized as three layers: a wallet-connected frontend, an oracle adapter, and an on-chain escrow contract.

```mermaid
flowchart LR
  U[User / Freighter Wallet] --> F[Next.js Frontend]
  F -->|create_gate / check_and_release| E[Soroban Escrow Contract]
  E -->|get_price| O[Soroban Oracle Contract]
  O --> R[Reflector Price Feed]
  E --> X[Stellar Explorer / On-chain records]
  F -->|reads escrow data| E
```

How it works:

1. The user connects Freighter in the frontend and creates an escrow form.
2. The frontend submits the transaction to the Soroban escrow contract on testnet.
3. The escrow contract stores the sender, recipient, amount, deadline, and condition on chain.
4. When settlement is checked, the escrow contract calls the oracle contract.
5. The oracle contract reads the Reflector feed and normalizes the XLM price.
6. The escrow contract compares the live price against the selected rule:
   - above target
   - below target
   - inside a price range
7. If the rule is met, funds release to the recipient; otherwise they stay locked until the deadline refund path.

This keeps the business rule fully on chain while the frontend remains a thin presentation and wallet layer.

## Repository Structure

```text
contracts/   Soroban oracle and escrow contracts
frontend/    Next.js frontend
```

## Screenshot Checklist



- ![Mobile ui](image-1.png)
![Mobile ui](image-2.png)
![Mobile ui](image-3.png)
- ![CI/CD](image.png)
![Cargo test](image-4.png)

## Local Setup

### Contracts

```bash
rustup target add wasm32-unknown-unknown
cargo install --locked stellar-cli
make build
make test
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

For Vercel, set the same environment variables from `frontend/.env.example` in the project settings before deploying.

## Tech Stack

- Smart contracts: Rust + Soroban SDK
- Oracle: Reflector Protocol (testnet)
- Frontend: Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion
- Wallet: Freighter
- Price feed: Horizon SSE and testnet RPC reads (updates every 5s)
- CI/CD: GitHub Actions
- Hosting: Vercel
