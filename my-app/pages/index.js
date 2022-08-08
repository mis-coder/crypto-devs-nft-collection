import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Contract, providers, utils } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "../constants";
import CustomButton from "../components/CustomButton";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../utils";

export default function Home() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");

  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 4) {
        throw new Error("Change the network to Rinkeby!");
      }

      if (needSigner) {
        return web3Provider.getSigner();
      }

      return web3Provider;
    } catch (error) {
      console.error(error);
      showToast("error");
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setIsWalletConnected(true);
    } catch (error) {
      console.error(error);
      showToast("error");
    }
  };

  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const _owner = await nftContract.owner();
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error);
      showToast("error");
    }
  };

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const _presaleStarted = await nftContract.presaleStarted();

      if (!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);

      return _presaleStarted;
    } catch (error) {
      console.error(error);
      showToast("error");

      return false;
    }
  };

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const _presaleEnded = await nftContract.presaleEnded();

      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
      setPresaleEnded(hasEnded);

      return hasEnded;
    } catch (error) {
      console.error(error);
      showToast("error");

      return false;
    }
  };

  const getTokenIdsMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const _tokenIds = await nftContract.tokenIds();

      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
      showToast("error");
    }
  };

  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const transaction = await nftContract.startPresale();
      setLoading(true);
      await transaction.wait();
      setLoading(false);

      await checkIfPresaleStarted();
    } catch (error) {
      console.error(error);
      showToast("error");
    }
  };

  const presaleMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const tx = await whitelistContract.presaleMint({
        // value signifies the cost of one crypto dev which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);

      showToast("success", "You have successfully minted a Crypto Dev!");
    } catch (error) {
      console.error(error);
      showToast("error");
    }
  };

  const publicMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      // call the mint from the contract to mint the Crypto Dev
      const tx = await whitelistContract.mint({
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);

      showToast("success", "You have successfully minted a Crypto Dev!");
    } catch (err) {
      console.error(err);
      showToast("error");
    }
  };

  const onPageLoad = async () => {
    await connectWallet();

    const _presaleStarted = await checkIfPresaleStarted();
    if (_presaleStarted) {
      checkIfPresaleEnded();
    }
  };

  useEffect(() => {
    if (!isWalletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      onPageLoad();

      getTokenIdsMinted();

      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted();
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5000);

      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5000);
    }
  }, [isWalletConnected]);

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer />
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 NFTs have been minted.
          </div>

          <CustomButton
            loading={loading}
            isWalletConnected={isWalletConnected}
            isOwner={isOwner}
            presaleStarted={presaleStarted}
            presaleEnded={presaleEnded}
            connectWallet={connectWallet}
            startPresale={startPresale}
            presaleMint={presaleMint}
            publicMint={publicMint}
          />
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
