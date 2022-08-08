import React from "react";
import styles from '../styles/Home.module.css';

const CustomButton = ({
  isWalletConnected,
  loading,
  isOwner,
  presaleStarted,
  presaleEnded,
  connectWallet,
  startPresale,
  presaleMint,
  publicMint,
}) => {

  let Button;

  if (!isWalletConnected) {
    Button =  (
      <button onClick={connectWallet} className={styles.button}>
        Connect your wallet
      </button>
    );
  }

  if (loading) {
    Button = (<button className={styles.button}>Loading...</button>);
  }

  if (isOwner && !presaleStarted) {
    Button =  (
      <button className={styles.button} onClick={startPresale}>
        Start Presale!
      </button>
    );
  }

  if (!isOwner && !presaleStarted) {
    Button =  (
      <div>
        <div className={styles.description}>Presale hasnt started!</div>
      </div>
    );
  }

  if (presaleStarted && !presaleEnded) {
    Button =  (
      <div>
        <div className={styles.description}>
          Presale has started!!! If your address is whitelisted, Mint a Crypto
          Dev 🥳
        </div>
        <button className={styles.button} onClick={presaleMint}>
          Presale Mint 🚀
        </button>
      </div>
    );
  }

  if (presaleStarted && presaleEnded) {
    Button =  (
      <button className={styles.button} onClick={publicMint}>
        Public Mint 🚀
      </button>
    );
  }
  return Button;
};

export default CustomButton;
