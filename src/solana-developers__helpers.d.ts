declare module '@solana-developers/helpers' {
    // Example: Adjust these types based on actual usage in your project
    import { Keypair } from '@solana/web3.js';
  
    /**
     * Gets a Keypair from an environment variable.
     * @param envVar The name of the environment variable containing the secret key.
     * @returns A Keypair object.
     */
    export function getKeypairFromEnvironment(envVar: string): Keypair;
  }
  