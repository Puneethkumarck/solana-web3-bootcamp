import { Cluster, Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getDomainKeySync } from "@bonfida/spl-name-service";

/**
 * Connect to the Solana network.
 * @param cluster The cluster to connect to ('devnet', 'testnet', 'mainnet-beta').
 * @returns A Connection object.
 */
const createConnection = (cluster: Cluster): Connection => {
  return new Connection(clusterApiUrl(cluster));
};

/**
 * Get the balance of a Solana account.
 * @param connection The Solana connection object.
 * @param publicKey The public key of the account.
 * @returns A Promise that resolves to the balance in lamports.
 */
const getAccountBalance = async (connection: Connection, publicKey: PublicKey): Promise<number> => {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance;
  } catch (error) {
    console.error('Failed to fetch account balance:', error);
    throw error;
  }
};

/**
 * Resolve a Solana domain name to a PublicKey using Bonfida's SPL Name Service.
 * @param domainName The domain name to resolve (e.g., 'toly.sol').
 * @returns A Promise that resolves to a PublicKey object.
 */
const resolveDomainName = async (domainName: string): Promise<PublicKey> => {
  try {
    const domainKey = getDomainKeySync(domainName);
    const publicKey = domainKey.pubkey;
    return publicKey;
  } catch (error) {
    console.error(`Failed to resolve domain name '${domainName}':`, error);
    throw error;
  }
};

/**
 * Main function to run the balance check script.
 */
const main = async (): Promise<void> => {
  try {
    // Create a connection to the Solana mainnet cluster
    const connection = createConnection('mainnet-beta');

    // Famous Solana domain names
    const domainNames = ['toly.sol', 'shaq.sol', 'mccann.sol'];

    for (const domainName of domainNames) {
      try {
        // Resolve domain name to PublicKey
        const publicKey = await resolveDomainName(domainName);

        // Get the balance of the account
        const balance = await getAccountBalance(connection, publicKey);

        // Convert the balance from lamports to SOL
        const balanceInSol = balance / LAMPORTS_PER_SOL;

        // Log the balance
        console.log(`The balance of the account at ${domainName} (${publicKey.toBase58()}) is ${balance} lamports (${balanceInSol} SOL).`);
      } catch (error) {
        console.error(`An error occurred while processing domain '${domainName}':`, error);
      }
    }

    console.log(`✅ Finished!`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

// Run the main function
main();
