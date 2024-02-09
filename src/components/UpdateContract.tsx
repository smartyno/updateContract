import React, { useState, Dispatch, SetStateAction } from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";

interface UpdateContractProps {
  contract: WalletContract | any;
  setUserBalance: Dispatch<SetStateAction<any>>;
  Tezos: TezosToolkit;
  userAddress: string;
  setStorage: Dispatch<SetStateAction<number>>;
}

const contractAddress = "KT1RcAzAx8BfeYE7dX7jFEvmHKbTcYMkCUgc"; // Hardcoded contract address

const UpdateContract = ({ contract, setUserBalance, Tezos, userAddress, setStorage }: UpdateContractProps) => {
  const [loadingReveal, setLoadingReveal] = useState<boolean>(false);
  const [tokenId, setTokenId] = useState<string>(""); // State to store the token ID

  const revealMetadata = async (): Promise<void> => {
    if (!tokenId) {
      // Validate that tokenId is not empty
      console.error("Token ID cannot be empty");
      return;
    }

    setLoadingReveal(true);
    try {
      const contract = await Tezos.wallet.at(contractAddress);
      const op = await contract.methods.reveal_metadata(tokenId).send();
      await op.confirmation();

      const newStorage: any = await contract.storage();
      if (newStorage) setStorage(newStorage.toNumber());

      setUserBalance(await Tezos.tz.getBalance(userAddress));
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingReveal(false);
    }
  };

  return (
    <div className="reveal-metadata">
      <p>
      <input
        type="text"
        placeholder="Enter Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      /> </p>
      <button className="button" disabled={loadingReveal} onClick={revealMetadata}>
        {loadingReveal ? (
          <span>
            <i className="fas fa-spinner fa-spin"></i>&nbsp; Please wait
          </span>
        ) : (
          <span>
            <i className="fas fa-arrow-up"></i>&nbsp; COMMIT REVEAL
          </span>
        )}
      </button>
    </div>
  );
};

export default UpdateContract;
