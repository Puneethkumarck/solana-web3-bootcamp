import { Cluster, Connection, clusterApiUrl } from "@solana/web3.js";

/**
 * Connects to the Solana cluster.
 * @param cluster The name of the Solana cluster to connect to (e.g., 'devnet', 'testnet', 'mainnet-beta').
 * @returns A Promise that resolves to a Connection object.
 */
const connectToCluster = async (cluster: Cluster): Promise<Connection> => {
  try {
    // Create a new connection to the specified Solana cluster
    const connection = new Connection(clusterApiUrl(cluster));

    // Optionally, you can add a simple check to verify the connection
    const version = await connection.getVersion();
    console.log('Connected to Solana cluster:', cluster);
    console.log('Cluster version:', version);

    return connection;
  } catch (error) {
    console.error('Failed to connect to Solana cluster:', error);
    throw error; // Re-throw the error after logging it
  }
};

/**
 * Main function to run the connection script.
 */
const main = async () => {
  try {
    // Connect to the 'devnet' Solana cluster
    const connection = await connectToCluster('devnet');
    
    // Connection established, you can add more functionality here
    console.log('Connection object:', connection);
  } catch (error) {
    // Handle any errors that occur during the connection process
    console.error('An error occurred:', error);
  }
};

// Run the main function
main();
