import { generateKeypair } from "../generatekeypair";
import { Keypair } from "@solana/web3.js";

describe('generateKeypair', () => {
  it('should generate a keypair with a valid public and secret key', () => {
    const keyPair = generateKeypair();
    
    // Test that public key exists and is of correct type
    expect(keyPair.publicKey).toBeDefined();
    expect(typeof keyPair.publicKey.toBase58()).toBe('string');
    
    // Test that secret key exists and is of correct length
    expect(keyPair.secretKey).toBeDefined();
    expect(keyPair.secretKey).toBeInstanceOf(Uint8Array);
    expect(keyPair.secretKey.length).toBe(64); // Solana secret keys are 64 bytes
  });
});
