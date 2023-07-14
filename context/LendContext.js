import React, { createContext, useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import Web3Modal from "web3modal";
const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
import axios from "axios";

import gainx from "./Gainx.json";
import gainxToken from "./GainxToken.json";
import tnt20Token from "./TNT20Token.json";

import { useRouter } from "next/router";

const CreateLendContext = createContext({});

// moonbeam
// tnt20 = 0x7B4CDa7e4d82D03F9681d41Ca7f66567757859A9
// gainxEscrow = 0x48Dffb4Bd4B02561083B983a7e6CC68AEDd84331

// const gainxContractAddress = "0x39EB736E460115CFa46D20e96548C3efAE56A3F4";
const gainxContractAddressXDC = "0x6CFD7ebe4dA3C3eF58f3796214580eD7fAa9f242";
// const gainxTokenContractAddress = "0xd4e6eC0202F1960dA896De13089FF0e4A07Db4E9";
const redeemGainxContractAddress = "0xEC6C1001a15c48D4Ea2C7CD7C45a1c5b6aD120E9";

// Gas-limit: 500000000

const gainxAbi = gainx.abi;
const gainxTokenAbi = gainxToken.abi;
const redeemTokenAbi = tnt20Token.abi;
let months = 3;

export const CreateLendProvider = ({ children }) => {
  const route = useRouter();
  const [currentAccount, setCurrentAccount] = useState("");
  const [graphPrompt, setGraphPrompt] = useState("");

  // Spheron
  const [uploadLink, setUploadLink] = useState("");
  const [dynamicLink, setDynamicLink] = useState("");

  const [ended, setEnded] = useState(true);

  const [wishlistForm, setWishlistForm] = useState({
    tenure: "",
    apy: "",
  });
  const [listClicked, setListClicked] = useState(false);
  const [myNftForm, setMyNftForm] = useState({
    nftAddress: "",
    nftId: "",
    chain: "XDC Apothem",
    estimatedAmount: "",
    tenure: "",
    apy: "",
    owner: "",
  });
  const [allListings, setAllListings] = useState([]);
  const [myNfts, setMyNfts] = useState([]);
  const [lenderList, setLenderList] = useState([]);
  const [borrowerList, setBorrowerList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeObject, setActiveObject] = useState({
    title: "",
    image: "",
    escrowId: "",
    amount: "",
    tenure: "",
    apy: "",
    borrower: "",
    accepted: "",
    isInsuared: "",
    lender: "",
    nftAddress: "",
    nftId: "",
  });

  const [offerId, setOfferId] = useState("");
  let [estAmt, setEstAmt] = useState("");
  const [sentiment, setSentiment] = useState(0.72);

  const [ethToUsd, setEthToUsd] = useState(null);
  const [glmrToUsd, setGlmrToUsd] = useState(null);
  const [linktoUsd, setLinktoUsd] = useState(null);

  const demoItem = {
    escrowId: "0",
    name: "Shiny APE",
    crypto: "40.7826",
    price: 183.5217,
    location: "Bored Ape Yacht Club",
    tenure: "4",
    isInsured: false,
  };

  useEffect(() => {
    setMyNftForm({ ...myNftForm, owner: currentAccount });
  }, [currentAccount]);

  useEffect(() => {
    (async () => {
      if (ethereum.isConnected()) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        setCurrentAccount(accounts[0]);
      }
    })();
  }, []);

  let offers = ["55.60", "50.20", "40.78", "21.91"];
  useEffect(() => {
    if (Number(myNftForm.tenure) == 1) {
      console.log("Offer 0");
      setEstAmt(offers[0]);
    } else if (Number(myNftForm.tenure) > 1 && Number(myNftForm.tenure) <= 3) {
      console.log("Offer 1");
      setEstAmt(offers[1]);
    } else if (Number(myNftForm.tenure) > 3 && Number(myNftForm.tenure) <= 6) {
      console.log("Offer 2");
      setEstAmt(offers[2]);
    } else {
      console.log("Offer 3");
      setEstAmt(offers[3]);
    }
  }, [myNftForm.tenure]);

  // AI/ML api integration
  const getNftEstPricesApi = async () => {
    const res = await axios({
      method: "get",
      url: `https://theta-rnn.onrender.com/predictions/contract_address=${myNftForm.nftAddress}&no_of_months=${myNftForm.tenure}`,
      withCredentials: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
    console.log("Est prices: ", res);
  };

  const trainModelApi = async () => {
    const res = await axios({
      method: "get",
      url: `https://theta-rnn.onrender.com/train_model/contract_address=${myNftForm.nftAddress}`,
      withCredentials: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
    console.log("Train Model: ", res);
  };

  const sentimentEndpoint = async () => {
    const res = await axios({
      method: "get",
      url: `https://theta-rnn.onrender.com/sentiment-analysis/keyword=${myNftForm.nftAddress}`,
      withCredentials: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
    console.log("Response: ", res);
  };

  // useEffect(() => {
  //   (
  //     async () => {
  //       await getNftEstPricesApi();
  //     }
  //   )();
  // }, [])

  const getAllListings = async () => {
    // here
    let results = [];
    let element;
    if (window.ethereum) {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        gainxContractAddressXDC,
        gainxAbi,
        provider
      );

      if (ethereum.isConnected()) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        console.log(accounts[0]);
      }

      const txRes = await contract.getExploreListings();

      txRes.map((escrow, i) => {
        element = {
          escrowId: Number(escrow.escrowId._hex),
          nftAddress: escrow.nftAddress,
          nftId: Number(escrow.nftId._hex),
          lender: escrow.lender,
          borrower: escrow.borrower,
          amount: utils.formatEther(Number(escrow.amount._hex).toString()),
          tenure: Number(escrow.tenure._hex),
          apy: Number(escrow.apy._hex),
          isInsuared: escrow.isInsuared,
          accepted: escrow.accepted,
          completed: escrow.completed,
        };

        results.push(element);
      });

      setAllListings(results);

      console.log("All Listings👽: ", txRes);
      return true;
    }
  };

  useEffect(() => {
    (async () => {
      await getAllListings();
    })();
  }, []);

  useEffect(() => {
    console.log("State listings: ", allListings);
    console.log("My NFTs list: ", myNfts);
    console.log("Lenders' list: ", lenderList);
    console.log("Borrowers' list: ", borrowerList);
  });

  const getMyNfts = async () => {
    let address;

    if (ethereum.isConnected()) {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      console.log(accounts[0]);
      // address = "0x9aCEcAF7e11BCbb9c114724FF8F51930e24f164b";
      address = accounts[0];

      const allNFTs = [];

      const chains = [EvmChain.MUMBAI, EvmChain.POLYGON];

      let i = 0;

      for (const chain of chains) {
        const response = await Moralis.EvmApi.nft.getWalletNFTs({
          address,
          chain,
        });

        allNFTs.push(...response.jsonResponse.result);
        i++;
      }

      setMyNfts(allNFTs);

      console.log("My NFTs💵: ", allNFTs);
    }

    try {
      await Moralis.start({
        apiKey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImY5NTRhNjgxLTAwNDUtNDNkMy1iYjkxLWYxYTBiOGEwMWM5YyIsIm9yZ0lkIjoiMjI4NTY4IiwidXNlcklkIjoiMjI5MTg1IiwidHlwZUlkIjoiMTUzYmFjNjYtYmFlMS00YzhlLWFiMDAtNmM3YmJmMjA3OGYzIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2ODMxMjQ0NTEsImV4cCI6NDgzODg4NDQ1MX0.bMwmShjXh4mKFoA8OgfOz8m2mV5wf6Ti1LnKkiKC8HI",
        // ...and any other configuration
      });
    } catch (error) {
      console.log("Moralis server re-initialzed");
    }
  };

  // useEffect(() =>
  //   (async () => {
  //     await getMyNfts();
  //   })();
  // }, []);

  const getLendedOffers = async () => {
    // here
    let results = [];
    let element;
    let userAddress;

    if (window.ethereum) {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        gainxContractAddressXDC,
        gainxAbi,
        provider
      );

      if (ethereum.isConnected()) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        console.log(accounts[0]);
        userAddress = accounts[0];
      }

      const txRes = await contract.getLendersList(userAddress);
      console.log("Lenders txRes: ", txRes);

      txRes.map((offer, i) => {
        element = {
          escrowId: Number(offer.escrowId._hex),
          nftAddress: offer.nftAddress,
          nftId: Number(offer.nftId._hex),
          lender: offer.lender,
          borrower: offer.borrower,
          amount: utils.formatEther(Number(offer.amount._hex).toString()),
          tenure: Number(offer.tenure._hex),
          apy: Number(offer.apy._hex),
          isInsuared: offer.isInsuared,
          accepted: offer.accepted,
          completed: offer.completed,
        };

        results.push(element);
      });

      setLenderList(results);

      console.log("Lenders List📞: ", results);
      return true;
    }
  };

  useEffect(() => {
    (async () => {
      await getLendedOffers();
    })();
  }, []);

  const getBorrowOffers = async () => {
    // here
    let results = [];
    let element;
    let userAddress;

    if (window.ethereum) {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        gainxContractAddressXDC,
        gainxAbi,
        provider
      );

      if (ethereum.isConnected()) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        console.log(accounts[0]);
        userAddress = accounts[0];
      }

      const txRes = await contract.getBorrowersList(userAddress);

      txRes.map((offer, i) => {
        element = {
          escrowId: Number(offer.escrowId._hex),
          nftAddress: offer.nftAddress,
          nftId: Number(offer.nftId._hex),
          lender: offer.lender,
          borrower: offer.borrower,
          amount: utils.formatEther(Number(offer.amount._hex).toString()),
          tenure: Number(offer.tenure._hex),
          apy: Number(offer.apy._hex),
          isInsuared: offer.isInsuared,
          accepted: offer.accepted,
          completed: offer.completed,
        };

        results.push(element);
      });

      setBorrowerList(results);

      console.log("Borrow List📞: ", results);
      return true;
    }
  };

  useEffect(() => {
    (async () => {
      await getBorrowOffers();
    })();
  }, []);

  // tableland

  const listNftToMarketplace = async ({
    nftAddress,
    nftId,
    chain,
    estimatedAmount,
    tenure,
    apy,
  }) => {
    let _borrower;

    try {
      if (window.ethereum) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          gainxContractAddressXDC,
          gainxAbi,
          signer
        );

        console.log("Console log 1");

        if (ethereum.isConnected()) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          console.log(accounts[0]);
          _borrower = accounts[0];
        }

        console.log("Console log 2");

        estAmt = utils.parseEther(estAmt); // string
        let listingPrice = utils.parseEther("0.01");

        console.log("Console log 3");

        console.log(
          "Log of all the fields: ",
          _borrower,
          estAmt,
          nftAddress,
          nftId,
          tenure,
          apy
        );

        const txRes = await contract._initEscrow(
          _borrower,
          estAmt,
          nftAddress,
          nftId,
          tenure,
          apy,
          {
            gasLimit: 3000000,
          }
        );

        console.log("Console log 4");

        setIsLoading(true);
        // await txRes.wait();
        setIsLoading(false);

        console.log("Console log 5");

        route.push("/marketplace");

        console.log(txRes);
        return true;
      }
    } catch (error) {
      alert("Error while listing Offer!");
    }
  };

  const acceptOffer = async ({ escrowId }) => {
    // const demoItem = {
    //   escrowId: "0",
    //   name: "Shiny APE",
    //   crypto: "40.7826",
    //   price: 183.5217,
    //   location: "Bored Ape Yacht Club",
    //   tenure: "4",
    //   isInsured: false,
    // };

    let txAmount, _borrower;
    let _isInsuared = false;
    try {
      if (window.ethereum) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          gainxContractAddressXDC,
          gainxAbi,
          signer
        );

        if (ethereum.isConnected()) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          console.log(accounts[0]);
          _borrower = accounts[0];
        }

        const res = await contract.idToEscrow(escrowId); // object --> amount: {_hex: '0x01'}
        txAmount = Number(res.amount._hex); // txAmount = 1 (Number)

        if (_isInsuared == true || _isInsuared === "true") {
          txAmount += 0.1 * txAmount; // premium amount, 1 + (0.1*1) = 1.1 (Number)
        }

        let txAmt = txAmount.toString(); // 1.1 --> '1.1'
        txAmount = txAmount.toString(); // 1.1 --> '1.1'
        txAmount = utils.parseEther(txAmount); // '1.1' --> '1.1 * 10^18'

        const txRes = await contract._acceptOffer(escrowId, _isInsuared, {
          value: txAmt, // '1.1 * 10^18'
          gasLimit: 3000000,
        });

        setIsLoading(true);
        // await txRes.wait(1);
        setIsLoading(false);

        console.log(txRes);
        return true;
      }
    } catch (error) {
      // alert("Error while accepting Offer!");
      console.log("Accept offer", error);
    }
  };

  const buyInsurance = async () => {
    // _escrowId
    //msg.sender, currEscrow.amount, _escrowId
    let txAmount;
    let lender;
    try {
      if (window.ethereum) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          gainxContractAddressXDC,
          gainxAbi,
          signer
        );

        if (ethereum.isConnected()) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          console.log(accounts[0]);
          lender = accounts[0];
        }

        // const res = await contract.idToEscrow(_escrowId); // object --> amount: {_hex: '0x01'}
        const res = await contract.idToEscrow(offerId); // object --> amount: {_hex: '0x01'}
        txAmount = Number(res.amount._hex); // txAmount = 1 (Number)

        txAmount = 0.1 * txAmount; // premium amount, (0.1*1) = 0.1 (Number)

        let amt = txAmount.toString(); // 0.1 --> '0.1'
        txAmount = txAmount.toString(); // 0.1 --> '0.1'
        txAmount = utils.parseEther(txAmount); // '0.1' --> '0.1 * 10^18'

        console.log("Formatted amount: ", Number(utils.formatEther(txAmount)));

        const txRes = await contract.buyInsurance(lender, txAmount, offerId, {
          value: amt, // '0.1'
          gasLimit: 3000000,
        });

        setIsLoading(true);
        // await txRes.wait(1);
        setIsLoading(false);

        console.log(txRes);
        return true;
      }
    } catch (error) {
      alert("Error while buying insurance!");
      console.log(error);
    }
  };

  const repayAmount = async () => {
    console.log("Repay fn called");
    let borrower;
    let _escrowId = offerId;
    try {
      if (window.ethereum) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          gainxContractAddressXDC,
          gainxAbi,
          signer
        );

        if (ethereum.isConnected()) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          console.log(accounts[0]);
          borrower = accounts[0];
        }

        const response = await contract.idToEscrow(offerId);
        let lenderAddr = response.lender;
        console.log("Lender: ", lenderAddr);

        const res = await contract.lenderToRepayAmt(lenderAddr);
        let amt = Number(res._hex).toString();
        // amt = utils.parseEther(amt);
        console.log("Lender address amt: ", Number(res._hex));

        const txRes = await contract._receiveRepayAmt(_escrowId, {
          gasLimit: 3000000,
          value: amt,
        });

        setIsLoading(true);
        // await txRes.wait(1);
        setIsLoading(false);

        console.log(txRes);
        return true;
      }
    } catch (error) {
      alert("Error while repaying amount!");
      console.log("Error repay: ", error);
    }
  };

  const reedemAmount = async () => {
    let lender;
    let _escrowId = offerId;
    console.log("Offer Id: ", _escrowId);
    try {
      if (window.ethereum) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          gainxContractAddressXDC,
          gainxAbi,
          signer
        );

        if (ethereum.isConnected()) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          console.log(accounts[0]);
          lender = accounts[0];
        }

        const txRes = await contract._receiveReedemAmt(_escrowId, {
          gasLimit: 3000000,
        });

        setIsLoading(true);
        // await txRes.wait(1);
        setIsLoading(false);

        console.log(txRes);
        return true;
      }
    } catch (error) {
      // alert("Error while redeeming amount!");
      console.log("Err Redeem Amt: ", error);
    }
  };

  const getIdToLendingStates = async (_escrowId, page) => {
    let items,
      results = [];
    if (page == "overview") items = [...borrowerList, ...lenderList];
    if (page == "lender") items = [lenderList];
    if (page == "borrower") items = [borrowerList];

    try {
      if (window.ethereum) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          gainxContractAddressXDC,
          gainxAbi,
          provider
        );

        if (ethereum.isConnected()) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          console.log(accounts[0]);
        }

        for (let i = 0; i < items.length; i++) {
          const txRes = await contract.idToLendingStates(_escrowId);
          results.push(txRes);
        }

        console.log("lending states💵💵💵💵: ", results);
        return results;
      }
    } catch (error) {
      // alert("Error while redeeming amount!");
      console.log("Err lending states Amt: ", error);
    }
  };

  useEffect(() => {
    getETHtoUSD();
    getXDCtoUSD();
    getLINKtoUSD();
  }, []);

  const getETHtoUSD = async () => {
    try {
      if (window.ethereum) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          gainxContractAddressXDC,
          gainxAbi,
          signer
        );

        const response = await contract.getETHtoUSD();
        console.log(
          "getETHtoUSD -> ",
          (response.toNumber() / 10 ** 8).toFixed(2)
        );

        setEthToUsd((response.toNumber() / 10 ** 8).toFixed(2));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getXDCtoUSD = async () => {
    try {
      if (window.ethereum) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          gainxContractAddressXDC,
          gainxAbi,
          signer
        );

        const response = await contract.getXDCtoUSD();
        console.log(
          "getXDCtoUSD -> ",
          (response.toNumber() / 10 ** 8).toFixed(2)
        );

        setGlmrToUsd((response.toNumber() / 10 ** 8).toFixed(2));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLINKtoUSD = async () => {
    try {
      if (window.ethereum) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          gainxContractAddressXDC,
          gainxAbi,
          signer
        );

        const response = await contract.getLINKtoUSD();
        console.log(
          "getLINKtoUSD -> ",
          (response.toNumber() / 10 ** 8).toFixed(2)
        );

        setLinktoUsd((response.toNumber() / 10 ** 8).toFixed(2));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const mintNFT = async () => {
    let receiver;
    try {
      if (window.ethereum) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          nftContractAddress,
          nftAbi,
          signer
        );

        if (ethereum.isConnected()) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          console.log(accounts[0]);
          receiver = accounts[0];
        }

        let mintingPrice = utils.parseEther("1.0");

        const txRes = await contract.safeMint(receiver, {
          value: mintingPrice,
          gasLimit: 3000000,
        });

        // await txRes.wait();

        console.log(txRes);
        return true;
      }
    } catch (error) {
      alert("Error while minting NFT!");
    }
  };

  return (
    <CreateLendContext.Provider
      value={{
        currentAccount,
        setCurrentAccount,
        wishlistForm,
        setWishlistForm,
        listClicked,
        setListClicked,
        myNftForm,
        setMyNftForm,
        allListings,
        setAllListings,
        getAllListings,
        myNfts,
        lenderList,
        borrowerList,
        isLoading,
        listNftToMarketplace,
        acceptOffer,
        buyInsurance,
        repayAmount,
        reedemAmount,
        activeObject,
        setActiveObject,
        offerId,
        setOfferId,
        estAmt,
        setEstAmt,
        ended,
        setEnded,
        getIdToLendingStates,
        sentiment,
        setSentiment,
        graphPrompt,
        setGraphPrompt,
        uploadLink,
        setUploadLink,
        dynamicLink,
        setDynamicLink,
        ethToUsd,
        glmrToUsd,
        linktoUsd,
      }}
    >
      {children}
    </CreateLendContext.Provider>
  );
};

export default CreateLendContext;
