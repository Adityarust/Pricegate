# PriceGate

[![Test Contracts](https://github.com/Adityarust/Pricegate/actions/workflows/test.yml/badge.svg)](https://github.com/Adityarust/Pricegate/actions/workflows/test.yml)

> Lock funds. Set conditions. Let the contract decide.

PriceGate is a Stellar escrow dApp that locks XLM and releases it when a price condition is met.

Live demo: https://pricegate-six.vercel.app

## Deployed Testnet Contracts

- Escrow contract: `CCSLZPGH365KUILNPFQ54HOQOSBWRL5Y5OVFP4M5S22GTDTYVCJV6TGM`
- Oracle contract: `CCS7PLDSW3KQJC5QDEMGFFMTEFPG2DDYPGQFXNQ6WURJSNPWTN466STU`
- Create gate tx: `688a743900d04512520b4e091d9884b2b682b4fd87fe00051bb8d16a0b5e7b0b`
- Release tx: `2fa08365672e57c65e8b6a9df6fbe67b1c033f9f41615fb9d4c6468ed4ca9948`

## What It Does

- Creates a non-custodial escrow on Stellar Testnet.
- Uses a live Reflector price feed for XLM/USD.
- Shows only the escrows created by the connected wallet in the UI.
- Exposes the on-chain record in Stellar Explorer for verification.

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

```bash
rustup target add wasm32-unknown-unknown
make build
make test
```
