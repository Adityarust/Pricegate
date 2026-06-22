.PHONY: build test clean fmt

# Build both contracts to WASM
build:
	cargo build --target wasm32-unknown-unknown --release

# Run all contract tests
test:
	cargo test

# Clean build artifacts
clean:
	cargo clean

# Format all Rust code
fmt:
	cargo fmt --all

# Check formatting without modifying files
fmt-check:
	cargo fmt --all -- --check

# Build a specific contract
build-oracle:
	cargo build --target wasm32-unknown-unknown --release -p pricegate-oracle

build-escrow:
	cargo build --target wasm32-unknown-unknown --release -p pricegate-escrow
