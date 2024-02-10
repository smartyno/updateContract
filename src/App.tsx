import React, { useState, useEffect } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import {
  NetworkType,
  BeaconEvent,
  defaultEventCallbacks,
} from "@airgap/beacon-dapp";

import "./App.css";
import qrcode from "qrcode-generator";
import ConnectButton from "./components/ConnectWallet";
import DisconnectButton from "./components/DisconnectWallet";
import UpdateContract from "./components/UpdateContract";

const App = () => {
  const [Tezos] = useState<TezosToolkit>(
    new TezosToolkit("https://mainnet.ecadinfra.com")
  );
  const [userAddress, setUserAddress] = useState<string>("");
  const [userBalance, setUserBalance] = useState<number>(0);
  const [storage, setStorage] = useState<number>(0);
  const [tokenId, setTokenId] = useState<string>("");
  const [beacon, setBeacon] = useState<BeaconWallet | null>(null);

  const contractAddress: string = "KT1RcAzAx8BfeYE7dX7jFEvmHKbTcYMkCUgc";

  const generateQrCode = (): { __html: string } => {
    const qr = qrcode(0, "L");
    qr.make();

    return { __html: qr.createImgTag(4) };
  };

  useEffect(() => {
    // Initialize Beacon wallet instance
    const initBeacon = async () => {
      const wallet = new BeaconWallet({
        name: "Commit-Reveal",
        preferredNetwork: NetworkType.MAINNET,
      });
      await wallet.requestPermissions();
      setBeacon(wallet);

      // Connect to Tezos network using Beacon wallet as signer provider
      Tezos.setWalletProvider(wallet);
    };

    initBeacon();

    const cleanup = () => {
      // Clean up Beacon wallet instance
      if (beacon) {
        beacon.clearActiveAccount();
  
      }
    };

    window.addEventListener("beforeunload", cleanup);

    return () => {
      // Remove event listener when the component unmounts
      window.removeEventListener("beforeunload", cleanup);
      cleanup();
    };
  }, []);

  

  const revealCommit = async (): Promise<void> => {
    try {
      console.log("Sending reveal metadata transaction...");
      const contract = await Tezos.wallet.at(contractAddress);
      const op = await contract.methods.reveal_metadata(tokenId).send();
      console.log("Transaction sent:", op);

      console.log("Waiting for confirmation...");
      await op.confirmation();
      console.log("Transaction confirmed");

      console.log("Fetching updated storage...");
      const newStorage: any = await contract.storage();
      console.log("Storage updated:", newStorage);

      console.log("Fetching user balance...");
      const balance = await Tezos.tz.getBalance(userAddress);
      setUserBalance(parseFloat(balance.toFixed()));
      console.log("User balance updated:", userBalance);
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  return (
    <div className="main-box">
      <h1>Commit Reveal</h1>
      <p>This App is a simple implementation of a commit-reveal mechanism on the Tezos blockchain. When you provide the token ID (the app is already set to the correct contract) and click the "Commit Reveal" button, the app sends a transaction to the Tezos blockchain, cheking if you indeed hold this token, and if yes, updating the metadata associated with the token ID. <br /> <br />
         In the context of the HEART-SHAPED, it will replace the initial image and the name of the token  -  with the one revealed. In simple words: the original image of the lake and its name will be displayed on the token as the primary (also on objkt.com).  <br /> <br />
         Once you click 'commit reveal', the app will ask you to connect your wallet again to approve the operation. Please keep in mined, once you confirm the operation - it becomes irreversible. In simple words: no one will ever be able to replace the original image of the lake back with the abstract one.

</p>
      <div id="dialog">
        <div id="content">
          <div className="reveal-metadata">
            <p>
              <input
                type="text"
                placeholder="Enter Token ID"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="input-field"
              />
            </p>
            <button className="button" onClick={revealCommit}>
              Commit Reveal
            </button>
          </div>
        </div>
      </div>
      <footer>
        <p>This app is based on <a href="https://github.com/ecadlabs/taquito-react-template">Taquito React Template</a></p>
      </footer>
    </div>
    
  );
};

export default App;
