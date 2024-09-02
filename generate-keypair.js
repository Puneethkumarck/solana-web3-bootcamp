import { Keypair } from "@solana/web3.js";
const keyPair = Keypair.generate();
console.log('public key is', keyPair.publicKey.toBase58())
console.log('keypair generated' , keyPair.secretKey)