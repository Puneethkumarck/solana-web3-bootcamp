import { config } from 'dotenv';
import { Keypair } from '@solana/web3.js';


// Load environment variables from .env file
config();

/**
 * Load the sender's keypair from an environment variable.
 * @returns A Keypair object.
 * @throws Will throw an error if the keypair cannot be loaded.
 */
const loadSenderKeypair = (): Keypair => {
  const secretKeyBase64 = process.env.SECRET_KEY;

  // Log the retrieved environment variable to ensure it's loaded correctly
  console.log("Retrieved SECRET_KEY from environment:", secretKeyBase64);

  if (!secretKeyBase64) {
    throw new Error("❌ SECRET_KEY not found in environment.");
  }

  try {
    let secretKey: Uint8Array;

    // Check if the secret key is in JSON format
    if (secretKeyBase64.startsWith('[')) {
      // Parse as JSON array
      secretKey = Uint8Array.from(JSON.parse(secretKeyBase64));
    } else {
      // Attempt to decode the base64 string
      secretKey = Buffer.from(secretKeyBase64, 'base64');
    }

    // Log the length of the decoded key to verify it's correct
    console.log("Decoded secret key length:", secretKey.length);

    // Check if the secret key length is 64 bytes
    if (secretKey.length !== 64) {
      console.error(`❌ Invalid secret key length: ${secretKey.length} bytes. Expected 64 bytes.`);
      throw new Error(`Invalid secret key length: ${secretKey.length} bytes.`);
    }

    // Log the decoded secret key for verification (do not do this in production)
    console.log("Decoded secret key:", secretKey);

    // If everything is correct, create and return the Keypair
    const keypair = Keypair.fromSecretKey(secretKey);

    // Log the generated keypair (public key and private key)
    console.log("Generated keypair:", keypair);

    return keypair;
  } catch (error) {
    console.error("Error while loading sender keypair:", error instanceof Error ? error.message : error);
    throw new Error("❌ Failed to load sender keypair from SECRET_KEY.");
  }
};

// Run the function (this is optional, remove if using as a module)
loadSenderKeypair();
