import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/WavePortal.json';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [waveCounts, setWaveCounts] = useState('');
  const [comment, setComment] = useState('');
  const [commentsArray, setCommentsArray] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const contactAddress = '0xc71FD1D12cCc907f81972Be08cfEE2BA9c6E11B9';
  const contractABI = abi.abi;
  const handleChange = e => {
    setComment(e.target.value);
  };

  //Check if user has Metamask
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('Make sure you have Metamask');
        return;
      } else {
        console.log('We have Ethereum object', ethereum);
      }

      //Check if we are authorized to use the user wallet
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account', account);
        setCurrentAccount(account);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contactAddress,
          contractABI,
          signer
        );
        let count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total waves... ', count.toNumber());
        setWaveCounts(count.toNumber());
        let messageBoard;
        messageBoard = await wavePortalContract.getAllWaves();
        let wavesCleaned = [];
        messageBoard.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });
        await setCommentsArray(wavesCleaned);
        console.log(commentsArray);
      } else {
        console.log('No accounts found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  //Implement wallet connect
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Get Metamask');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });
      console.log('Connected', account[0]);
      setCurrentAccount(account[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contactAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total waves... ', count.toNumber());

        await setIsLoading(true);
        const waveTxn = await wavePortalContract.wave(comment, { gasLimit: 300000 });
        console.log('Mining...', waveTxn.hash);


        await waveTxn.wait();
        console.log('Mined...', waveTxn.hash);


        count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total waves... ', count.toNumber());
        await setWaveCounts(count.toNumber());

        //update Message Board///////////////////////////////////////

        let messageBoard;
        messageBoard = await wavePortalContract.getAllWaves();
        await setCommentsArray(messageBoard);
        await setIsLoading(false);
        setComment('');
      } else {
        console.log('There is no ethereum Object');
      }


    } catch (error) {
      console.log(error);
    }
    // console.log(waveCounts);
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Wave Me!</div>

        <div className="bio">
          Hi, my name is Chibu, I am 37 and just starting to learn how to write
					Blockchain code. Please say something cool to me and{' '}
          <strong>Wave Me.</strong>
          <br /> (Dont forget to drop your name and location)
				</div>
        <div>
          <h3 className="bio">Total Number of Waves So Far: {waveCounts} </h3>
        </div>
        {!isLoading && (
          <input
            type="text"
            value={comment}
            placeholder="Say Something Cool :)"
            maxlength="100"
            onChange={handleChange}
          />
        )}

        {!isLoading && (
          <button className="waveButton" onClick={wave}>
            Wave Me
				</button>
        )}

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
					</button>
        )}

        {isLoading && <div className="bio">...Please wait. Message is Loading</div>}

        <div className="bio">{commentsArray.map((e, index) => <ul key={index}> {e.message} </ul>)}</div>
      </div>
    </div>
  );
}
