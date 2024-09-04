import {
    Connection,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
    PublicKey,
    Cluster,
    clusterApiUrl,
    Keypair,
  } from "@solana/web3.js";
  import "dotenv/config";
  
  /**
   * Connect to the Solana network.
   * @param cluster The cluster to connect to ('devnet', 'testnet', 'mainnet-beta').
   * @returns A Connection object.
   */
  const createConnection = (cluster: Cluster): Connection => {
    return new Connection(clusterApiUrl(cluster));
  };
  
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
      if (secretKeyBase64.startsWith("[")) {
        // Parse as JSON array
        secretKey = Uint8Array.from(JSON.parse(secretKeyBase64));
      } else {
        // Attempt to decode the base64 string
        secretKey = Buffer.from(secretKeyBase64, "base64");
      }
  
      // Log the length of the decoded key to verify it's correct
      console.log("Decoded secret key length:", secretKey.length);
  
      // Check if the secret key length is 64 bytes
      if (secretKey.length !== 64) {
        console.error(
          `❌ Invalid secret key length: ${secretKey.length} bytes. Expected 64 bytes.`
        );
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
      console.error(
        "Error while loading sender keypair:",
        error instanceof Error ? error.message : error
      );
      throw new Error("❌ Failed to load sender keypair from SECRET_KEY.");
    }
  };
  
  /**
   * Validates if a given string is a valid Solana public key.
   * @param pubkey - The string to validate.
   * @returns A boolean indicating if the string is a valid public key.
   */
  const isValidPublicKey = (pubkey: string): boolean => {
    try {
      new PublicKey(pubkey);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Get the balance of a Solana account.
   * @param connection The Solana connection object.
   * @param publicKey The public key of the account.
   * @returns A Promise that resolves to the balance in lamports.
   */
  const getAccountBalance = async (
    connection: Connection,
    publicKey: PublicKey
  ): Promise<number> => {
    try {
      const balance = await connection.getBalance(publicKey);
      return balance;
    } catch (error) {
      console.error("Failed to fetch account balance:", error);
      throw error;
    }
  };
  
  /**
   * Create a transaction to send SOL to a specified public key.
   * @param fromPubkey The sender's public key.
   * @param toPubkey The recipient's public key.
   * @param lamports The amount of lamports to send.
   * @returns A Transaction object.
   */
  const createTransaction = (
    fromPubkey: PublicKey,
    toPubkey: PublicKey,
    lamports: number
  ): Transaction => {
    const transaction = new Transaction();
    const sendSolInstruction = SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports,
    });
    transaction.add(sendSolInstruction);
    return transaction;
  };
  
  /**
   * Main function to execute the script.
   */
  const main = async (): Promise<void> => {
    try {
      // Fetch the destination public key from the command line arguments
      const suppliedToPubkey = process.argv[2];
      if (!suppliedToPubkey || !isValidPublicKey(suppliedToPubkey)) {
        console.error("❌ Please provide a valid public key to send to.");
        process.exit(1);
      }
  
      // Load sender keypair from environment variable
      const senderKeypair = loadSenderKeypair();
      console.log(`✅ Loaded sender keypair from environment.`);
  
      // Convert the supplied public key string to a PublicKey object
      const toPubkey = new PublicKey(suppliedToPubkey);
      console.log(`✅ Destination public key: ${toPubkey.toBase58()}`);
  
      // Create a connection to the Solana devnet
      const connection = createConnection("devnet");
      console.log(`✅ Connected to the Solana devnet.`);
  
      // Check the sender's balance
      const balance = await getAccountBalance(connection, senderKeypair.publicKey);
      console.log(`💰 Sender's current balance: ${balance} lamports`);
  
      // Check rent exemption amount
      const rentExemptionAmount = await connection.getMinimumBalanceForRentExemption(
        0
      );
      console.log(`💰 Rent exemption amount: ${rentExemptionAmount} lamports`);
  
      // Check and top up recipient account if necessary
      const recipientBalance = await getAccountBalance(connection, toPubkey);
      console.log(`💰 Recipient's current balance: ${recipientBalance} lamports`);
  
      if (recipientBalance < rentExemptionAmount) {
        console.log(`🔄 Recipient balance is low. Requesting airdrop of 1 SOL...`);
        const recipientAirdropSignature = await connection.requestAirdrop(
          toPubkey,
          1e9
        ); // 1 SOL = 1e9 lamports
        await connection.confirmTransaction(recipientAirdropSignature);
        console.log(`✅ Recipient airdrop successful!`);
      }
  
      // Ensure the balance is enough for rent exemption and the transaction
      const LAMPORTS_TO_SEND = 5000; // Amount to send
      const TOTAL_REQUIRED = rentExemptionAmount + LAMPORTS_TO_SEND;
  
      if (balance < TOTAL_REQUIRED) {
        console.log(`🔄 Balance is low. Requesting airdrop of 1 SOL...`);
        const airdropSignature = await connection.requestAirdrop(
          senderKeypair.publicKey,
          1e9
        ); // 1 SOL = 1e9 lamports
        await connection.confirmTransaction(airdropSignature);
        console.log(`✅ Airdrop successful!`);
  
        // Recheck the balance after airdrop
        const newBalance = await getAccountBalance(
          connection,
          senderKeypair.publicKey
        );
        console.log(`💰 New balance: ${newBalance} lamports`);
  
        if (newBalance < TOTAL_REQUIRED) {
          throw new Error("❌ Insufficient funds even after airdrop.");
        }
      }
  
      // Create and send the transaction
      const transaction = createTransaction(
        senderKeypair.publicKey,
        toPubkey,
        LAMPORTS_TO_SEND
      );

      // Serialize the transaction message and convert to base64
     // const serializedMessage = transaction.serializeMessage().toString("base64");
     // Print the serialized message in base64 format
     // console.log(serializedMessage);
    
      try {
        const signature = await sendAndConfirmTransaction(connection, transaction, [
          senderKeypair,
        ]);
        console.log(
          `💸 Finished! Sent ${LAMPORTS_TO_SEND} lamports to ${toPubkey.toBase58()}.`
        );
      } catch (error) {
        if (error instanceof Error) {
          console.error("An error occurred during transaction:", error.message);
        }
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error("An error occurred:", errorMessage);
      process.exit(1);
    }
  };
  
  // Execute the main function
  main();
  