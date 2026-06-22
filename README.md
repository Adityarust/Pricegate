# PriceGate

> Lock funds. Set conditions. Let the contract decide.

A Stellar dApp that locks XLM in an escrow contract which only releases funds when a price condition is met.

Built on [Soroban](https://soroban.stellar.org/) smart contracts with [Reflector Protocol](https://reflector.network/) oracle integration.

## Status

🚧 Under active development

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (Next.js)              │
│         Freighter Wallet  ·  Horizon SSE         │
└──────────────┬──────────────────┬────────────────┘
               │                  │
       ┌───────▼───────┐  ┌──────▼───────┐
       │ Escrow Contract│  │ Oracle Contract│
       │  (Soroban)     │──│  (Soroban)     │
       └───────────────┘  └───────┬────────┘
                                  │
                          ┌───────▼────────┐
                          │ Reflector Oracle│
                          │  (Testnet)      │
                          └────────────────┘
```

## Setup

```bash
# Install Rust + Soroban CLI
rustup target add wasm32-unknown-unknown

# Build contracts
make build

# Run tests
make test
```
