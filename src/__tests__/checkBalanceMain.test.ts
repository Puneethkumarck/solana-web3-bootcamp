import { Cluster, Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getDomainKeySync } from "@bonfida/spl-name-service";
import { createConnection, getAccountBalance, resolveDomainName } from "../checkBalanceMain";

// Mock specific functions rather than the entire module to avoid breaking constructor behavior.
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
  })
}));

describe('Solana Script', () => {
  beforeAll(() => {
    jest.spyOn(Connection.prototype, 'getBalance').mockResolvedValue(1000000000); // Mock balance of 1 SOL in lamports
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('createConnection', () => {
    it('should create a connection to the correct Solana cluster', () => {
      const cluster: Cluster = 'mainnet-beta';
      const connection = createConnection(cluster);
      expect(connection).toBeInstanceOf(Connection); // Test if the object is an instance of the Connection class
    });
  });

  describe('resolveDomainName', () => {
    it('should resolve toly.sol to the correct public key', async () => {
      const publicKey = await resolveDomainName('toly.sol');
      expect(publicKey.toBase58()).toBe("CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN");
    });

    it('should throw an error for an unknown domain', async () => {
      const originalConsoleError = console.error;
      console.error = jest.fn();

      await expect(resolveDomainName('unknown.sol')).rejects.toThrow('Domain unknown.sol not found');

      console.error = originalConsoleError;
    });
  });

  describe('getAccountBalance', () => {
    it('should return the correct balance in lamports', async () => {
      const cluster: Cluster = 'mainnet-beta';
      const connection = createConnection(cluster);
      const publicKey = new PublicKey("CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN");
      const balance = await getAccountBalance(connection, publicKey);
      expect(balance).toBe(1000000000); // Mocked balance of 1 SOL in lamports
    });
  });
});
