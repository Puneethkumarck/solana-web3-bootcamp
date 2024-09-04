import { Cluster, Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";

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
 * Main function to run the balance check script.
 */
const main = async (): Promise<void> => {
  try {
    // Create a connection to the Solana devnet cluster
    const connection = createConnection('devnet');

    // Create a PublicKey object for the specified address
    const address = new PublicKey("CVSvjutqskYyF1hZTyZARGjGvf8d1Pp9mJMAJ8hTMHhm");

    // Get the balance of the account
    const balance = await getAccountBalance(connection, address);

    // Convert the balance from lamports to SOL
    const balanceInSol = balance / LAMPORTS_PER_SOL;

    // Log the balance
    console.log(`The balance of the account at ${address.toBase58()} is ${balance} lamports (${balanceInSol} SOL).`);
    console.log(`✅ Finished!`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

// Run the main function
main();
