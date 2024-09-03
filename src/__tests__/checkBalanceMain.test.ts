import { Cluster, Connection, PublicKey } from "@solana/web3.js";
import { getDomainKeySync } from "@bonfida/spl-name-service";
import { createConnection, getAccountBalance, resolveDomainName } from "../checkBalanceMain";

// Mock the getDomainKeySync function to provide predefined public keys for testing
jest.mock("@bonfida/spl-name-service", () => ({
  getDomainKeySync: jest.fn().mockImplementation((domainName: string) => {
    switch (domainName) {
      case 'toly.sol':
        return { pubkey: new PublicKey("CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN") };
      case 'shaq.sol':
        return { pubkey: new PublicKey("BNDGUhH1DtP7zLV2koxTukxfiAE9F6a9GhACGmGcih4C") };
      case 'mccann.sol':
        return { pubkey: new PublicKey("CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN") };
      default:
        throw new Error(`Domain ${domainName} not found`);
    }
  }),
}));

describe('Solana Script Tests', () => {
  // Mock the getBalance method to return a predefined balance
  beforeAll(() => {
    jest.spyOn(Connection.prototype, 'getBalance').mockResolvedValue(1000000000); // 1 SOL in lamports
  });

  // Restore all mocks after the tests have completed
  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('createConnection', () => {
    it('should create a connection to the correct Solana cluster', () => {
      const cluster: Cluster = 'mainnet-beta';
      const connection = createConnection(cluster);
      
      // Verify that the connection is an instance of the Connection class
      expect(connection).toBeInstanceOf(Connection);
    });
  });

  describe('resolveDomainName', () => {
    it('should resolve toly.sol to the correct public key', async () => {
      const publicKey = await resolveDomainName('toly.sol');
      
      // Expect the public key to match the mocked value for toly.sol
      expect(publicKey.toBase58()).toBe("CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN");
    });

    it('should throw an error for an unknown domain', async () => {
      // Suppress console.error during this test to keep output clean
      const originalConsoleError = console.error;
      console.error = jest.fn();

      await expect(resolveDomainName('unknown.sol')).rejects.toThrow('Domain unknown.sol not found');

      // Restore console.error after the test
      console.error = originalConsoleError;
    });
  });

  describe('getAccountBalance', () => {
    it('should return the correct balance in lamports', async () => {
      const cluster: Cluster = 'mainnet-beta';
      const connection = createConnection(cluster);
      const publicKey = new PublicKey("CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN");
      const balance = await getAccountBalance(connection, publicKey);
      
      // Expect the balance to be 1000000000 lamports (mocked value)
      expect(balance).toBe(1000000000);
    });
  });
});
