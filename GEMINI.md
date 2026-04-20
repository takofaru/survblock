# Stellar Notes DApp - GEMINI Context

## Project Overview
This project is a decentralized note-taking system built on the **Stellar** blockchain using the **Soroban SDK**. It allows users to create, retrieve, and delete notes securely on the blockchain.

The project structure suggests it is a **workshop starter or template**, with placeholders in the source code (`contracts/notes/src/lib.rs`) for students or developers to implement the core logic.

### Main Technologies
- **Rust**: The primary programming language.
- **Soroban SDK**: Framework for building smart contracts on Stellar.
- **Wasm**: The target compilation format for Soroban contracts.

## Directory Structure
- `contracts/notes/`: Contains the source code for the notes smart contract.
    - `src/lib.rs`: The main contract implementation.
    - `src/test.rs`: Contract tests.
    - `Makefile`: Build and test automation.
    - `Cargo.toml`: Contract-specific dependencies.
- `Cargo.toml`: Workspace configuration for the project.

## Building and Running
A `Makefile` is provided in `contracts/notes/` to simplify common tasks.

- **Build the contract:**
  ```bash
  cd contracts/notes
  make build
  # Or using stellar-cli directly:
  stellar contract build
  ```
- **Run tests:**
  ```bash
  cd contracts/notes
  make test
  # Or using cargo:
  cargo test
  ```
- **Format code:**
  ```bash
  cd contracts/notes
  make fmt
  ```
- **Clean build artifacts:**
  ```bash
  cd contracts/notes
  make clean
  ```

## Development Conventions
- **Contract Environment**: Contracts are `no_std` and utilize Soroban-specific types like `Env`, `String`, `Symbol`, and `Vec`.
- **Storage**: Data is intended to be stored in the contract's instance storage using `env.storage().instance()`.
- **Testing**: Tests are located in `src/test.rs` and use `soroban-sdk`'s `testutils`.
- **Formatting**: The project follows standard Rust formatting rules (`cargo fmt`).

## Implementation Roadmap (Internal Task)
The current implementation in `contracts/notes/src/lib.rs` contains placeholders and a reference implementation in comments. To complete the contract:
1. Define the `Note` struct fields (e.g., `id`, `title`, `content`).
2. Implement `get_notes` to fetch data from instance storage.
3. Implement `create_note` with ID generation and storage persistence.
4. Implement `delete_note` with search-and-remove logic.
5. Add comprehensive tests in `src/test.rs`.
