# File Integrity Verification and Timestamping on Ethereum Blockchain

This is a Next.js project that allows users to generate a checksum of a file and store it on the Ethereum blockchain. This provides a way to verify the integrity and timestamp of a file at a given time.

## Project Goal

The goal of this project is to provide a way for users to verify the integrity and timestamp of a specific file. By storing a checksum of the file on the Ethereum blockchain, we can create a timestamped record that is immutable and verifiable.

## How It Works

1. **File Checksum Generation**: The user uploads a file to the application. The application generates a checksum of the file. This checksum is a unique identifier for the file.

2. **Checksum Storage**: The application stores the checksum on the Ethereum blockchain. This creates a permanent, timestamped record of the file.

3. **File Verification**: At any point in the future, the user can verify the integrity and timestamp of the file. They do this by generating a new checksum of the file and comparing it to the stored checksum on the Ethereum blockchain.

## Main Technical Stack

This project is built using a robust and modern tech stack:

- [Next.js](https://nextjs.org/): A powerful React framework for building the frontend, providing a fast and efficient user interface.
- [Ethereum](https://ethereum.org/): Leveraged for secure and immutable storage of file checksums on its blockchain.
- SHA-256: A cryptographic hash function used for generating reliable file checksums.
- [Hardhat](https://hardhat.org/): A development environment for Ethereum, simplifying tasks like compiling and testing Ethereum smart contracts.

## Why Ethereum?

Ethereum was chosen for this project due to its decentralized and immutable nature. The Ethereum blockchain serves as a public ledger, ensuring that once the checksum of a file is stored, it cannot be altered or deleted. This immutability is crucial for the integrity of the file verification process. Furthermore, Ethereum's smart contract functionality allows for the automation of the checksum storage process, making it a reliable and efficient choice for this project.

## Safety of SHA-256 Checksum

SHA-256 is a cryptographic hash function that produces a unique output (or 'digest') for every unique input. It's like a digital fingerprint for your file. Even a small change in the file will produce a completely different checksum. This makes it extremely unlikely for two different files to have the same SHA-256 checksum, ensuring the reliability of the file verification process. Furthermore, it's a one-way function, meaning that it's practically impossible to recreate the original file from the checksum. This ensures the privacy of your file, as the checksum doesn't reveal any information about the file's content.

# COMMANDS
Launch stripe local CLI : `stripe listen --forward-to localhost:4242/webhook`