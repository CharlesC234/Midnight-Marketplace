import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import axios from 'axios';
import { BiPurchaseTag } from "react-icons/bi";
import { SlCalender } from "react-icons/sl";
import { useActiveAccount, useActiveBalance} from "thirdweb/react";
const { WalletService } = require("@unlock-protocol/unlock-js");
// import { useSigner } from '@thirdweb-dev/react';
// import { create as ipfsHttpClient } from 'ipfs-http-client'
// const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import {
  marketplaceAddress
} from '../config'
import LOCKMarketplace from '../artifacts/contracts/LOCKMarketplace.sol/LOCKMarketplace.json'

const client = createThirdwebClient({ 
  clientId: "120d825da9753a57a507a52b8c0c40af"
 });
 //n6qyVnMsw2dpFO1iuWdmSUH9s0DWtHxuruW9HFraaR8sszN0D3rmgshcZhVp6_VuRatM87wAqC_mVNXdmoiMUg



const networks = {
  137: { // Polygon
    unlockAddress: '0xE8E5cd156f89F7bdB267EabD5C43Af3d5AF2A78f', // Replace with correct address for Goerli
    provider: 'https://rpc.unlock-protocol.com/137',
  },
};

export default function CreateItem() {
  const [fileImg, setFile] = useState(null)
  const [name, setName] = useState("")
  const [desc, setDescription] = useState("");
  const [priceInput, setPrice] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [duration, setDuration] = useState(12121311);
  const [paymentOption, setPaymentOption] = useState("one-time");
  const [fileTempURL, setFileTempURL] = useState(null);
  const [contract, setContract] = useState(null)
  const router = useRouter()
  const API_KEY_PINATA = "b0eaa7a203fe4e31977b"
  const API_SECRET_PINATA = "fc3ec9468b6ad8821b8435658839de413a0acabe08505560abc6958ccc93fd97"
  // const marketplaceAddress = "0xc2Bb770D3F038471D8df1A5ad8D546fC41B5d133"; // Replace with your marketplace contract address

  // get wallet address
  const account = useActiveAccount();
  const walletAddress = account?.address;
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  // const signer = useSigner();



  useEffect(() => {
    console.log("wallet address", account?.address);
    if (account) {
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      const ethersSigner = ethersProvider.getSigner();
      setProvider(ethersProvider);
      setSigner(ethersSigner);
    }
  }, [account]);




  const deployContract = async (tokenURI) => {
    if (!signer) {
      console.error('Signer is not initialized');
      return;
    }

    const walletService = new WalletService(networks);

    // Connect to the provider with the user's signer
    await walletService.connect(provider, signer);
    console.log("quantity: " + quantity);
    try {
      const transactionAddress = await walletService.createLock(
        {
          maxNumberOfKeys: parseInt(quantity),
          name: name,
          expirationDuration: duration,
          keyPrice: priceInput, // Key price needs to be a string
        },
        {}, // transaction options
        (error, hash) => {
          // This is the hash of the transaction!
          console.log(hash);
        }
      );

      // Wait for the transaction to be mined
      console.log("Transaction mined, address: " + transactionAddress);
      const lockAddress = transactionAddress;

      // Create an instance of the lock contract
      const lockAbi = [ // Minimal ABI required to interact with the setLockMetadata function
        "function setLockMetadata(string _lockName, string _lockSymbol, string _baseTokenURI) external",
      ];
      const lockContract = new ethers.Contract(lockAddress, lockAbi, signer);

      // Set the lock metadata
      const tx = await lockContract.setLockMetadata(name, "KEY", tokenURI);
      await tx.wait(); // Wait for the transaction to be mined

      console.log('Lock metadata updated successfully');

      const marketplaceContract = new ethers.Contract(marketplaceAddress, LOCKMarketplace.abi, signer);
      
      console.log(marketplaceContract);

      const estimatedGas = await marketplaceContract.estimateGas.addLock(lockAddress, tokenURI);

      console.log(`Estimated Gas: ${estimatedGas.toString()}`);

    // Add the lock to the marketplace with the estimated gas limit
    const addLockTx = await marketplaceContract.addLock(
        lockAddress, tokenURI,
        {
            gasLimit: estimatedGas.add(ethers.BigNumber.from("10000")), // Adding a buffer
        }
    );

      console.log("waiting for transaction to be mined");
      await addLockTx.wait(); // Wait for the transaction to be mined

      console.log("Lock added to the marketplace successfully");

    } catch (error) {
      console.error('Error:', error);
    }
  };


  // async function onChange(e) {
  //   const file = e.target.files[0]
  //   try {
  //     const added = await client.add(
  //       file,
  //       {
  //         progress: (prog) => console.log(`received: ${prog}`)
  //       }
  //     )
  //     const url = `https://ipfs.infura.io/ipfs/${added.path}`
  //     setFileUrl(url)
  //   } catch (error) {
  //     console.log('Error uploading file: ', error)
  //   }  
  // }


  // async function uploadToIPFS() {
  //   const { name, description, price } = formInput
  //   if (!name || !description || !price || !fileUrl) return
  //   /* first, upload to IPFS */
  //   const data = JSON.stringify({
  //     name, description, image: fileUrl
  //   })
  //   try {
  //     const added = await client.add(data)
  //     const url = `https://ipfs.infura.io/ipfs/${added.path}`
  //     /* after file is uploaded to IPFS, return the URL to use it in the transaction */
  //     return url
  //   } catch (error) {
  //     console.log('Error uploading file: ', error)
  //   }  
  // }

  const sendJSONtoIPFS = async (ImgHash) => {

    try {

      const resJSON = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
        data: {
          "name": name,
          "description": desc,
          "image": ImgHash
        },
        headers: {
          'pinata_api_key': API_KEY_PINATA,
          'pinata_secret_api_key': API_SECRET_PINATA,

        },
      });

      // https://gateway.pinata.cloud/ipfs/QmZ6iZAhazHyakzynC4sxZ6r6cikJmS69mZaCoyburKuq


      const tokenURI = `https://gateway.pinata.cloud/ipfs/${resJSON.data.IpfsHash}`;
      console.log("Token URI", tokenURI);
      //mintNFT(tokenURI, currentAccount)   // pass the winner
      // listNFTForSale(tokenURI)
      deployContract(tokenURI);
    } catch (error) {
      console.log("JSON to IPFS: ")
      console.log(error);
    }

  }




  const sendFileToIPFS = async (e) => {

    e.preventDefault();
    console.log("123");
    console.log(e);


    if (fileImg) {
      try {

        console.log("1234");
        const formData = new FormData();
        formData.append("file", fileImg);
        console.log(formData)
        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            'pinata_api_key': API_KEY_PINATA,
            'pinata_secret_api_key': API_SECRET_PINATA,
            "Content-Type": "multipart/form-data"
          },
        });

        const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        console.log(ImgHash);
        sendJSONtoIPFS(ImgHash)


      } catch (error) {
        console.log("File to IPFS: ")
        console.log(error)
      }
    }
  }

  // async function listNFTForSale(url) {
  //   const web3Modal = new Web3Modal()
  //   const connection = await web3Modal.connect()
  //   const provider = new ethers.providers.Web3Provider(connection)
  //   const signer = provider.getSigner()

  //   /* next, create the item */
  //   const price = ethers.utils.parseUnits(priceInput, 'ether')
  //   let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
  //   let listingPrice = await contract.getListingPrice()
  //   listingPrice = listingPrice.toString()
  //   let transaction = await contract.createToken(url, price, { value: listingPrice })
  //   await transaction.wait()
   
  //   router.push('/')
  // }

  console.log(fileImg);

  return (
    <div className='flex flex-col h-auto'>
    <div className="flex flex-col container grow h-auto mb-0" style={{color: '#121212',}}>
    <p className='font-bold text-3xl mb-4 text-white' style={{opacity: .875}}>Create Listing</p>
       <div className='flex flex-row mt-5'>
      <div className="w-1/2 flex flex-col pb-12">
      <p className="text-md font-bold pt-0 ps-0" style={{color: "rgba(255,255,255,.85)"}}>Name*</p>
        <input 
          placeholder="Asset Name"
          className="mt-3 border rounded-lg p-2.5 bg-transparent border-zinc-700 text-white"
          onChange={(e) => setName(e.target.value)}
        />
        <p className="text-md font-bold pt-7 ps-0" style={{color: "rgba(255,255,255,.85)"}}>Description*</p>
        <textarea
          placeholder="Asset Description"
          className="mt-3 border text-white rounded-lg p-2.5 bg-transparent border-zinc-700"
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="text-md font-bold pt-7 ps-0 mb-5" style={{color: "rgba(255,255,255,.85)"}}>Select Payment Type</p>
        <div className='flex flex-row justify-between w-100 h-auto'>

          <button onClick={() => {setPaymentOption('one-time')}} className={`w-1/2 me-5 h-auto rounded-xl p-5 flex flex-col justify-start ${paymentOption == 'one-time' ? ' border-2 border-purple-500' : 'border-2 border-[#121212]'}`} style={{backgroundColor: '#1b1b1b'}}>
          <div className='flex flex-row'>
          <BiPurchaseTag size={40} color={'rgba(255,255,255,.9)'}/>
          <p className="text-md font-bold text-left my-auto ms-5" style={{color: "rgba(255,255,255,.85)"}}>One Time Payments</p>
          </div>
          <p className="text-sm text-left mt-4 mb-2" style={{color: "rgba(255,255,255,.8)"}}>Buyers will pay one time for this NFT, and own it until either they sell it or it is burned. The NFT can easily be burned once purchase verified by the creator (you) to allow for a seamless transaction</p>
          </button>

          <button onClick={() => {setPaymentOption('subscription')}} className={`w-1/2 h-auto rounded-xl p-5 flex flex-col justify-start ${paymentOption == 'subscription' ? ' border-2 border-purple-500' : 'border-2 border-[#121212]'}`} style={{backgroundColor: '#1b1b1b'}}>
          <div className='flex flex-row'>
          <SlCalender size={40} color={'rgba(255,255,255,.9)'}/>
          <p className="text-md font-bold my-auto ms-5" style={{color: "rgba(255,255,255,.85)"}}>Subscription Payments</p>
          </div>
          <p className="text-sm text-left mt-4 mb-2" style={{color: "rgba(255,255,255,.8)"}}>Buyers hold the NFT until they cancel their subscription and stop paying for it. Creators can set how often a subscriber is charged (duration) as well as free trials and other settings</p>
          </button>
        </div>

        <div className={`w-100 ${paymentOption == 'subscription' ? 'visible' : 'hidden'}`}>

        <p className="text-md font-bold pt-7 ps-0" style={{color: "rgba(255,255,255,.85)"}}>Membership Duration (in days)*</p>
        <input
          placeholder="Duration in Days"
          style={{width: '100%'}}
          className="mt-3 text-white border rounded-lg p-2.5 bg-transparent border-zinc-700"
          onChange={(e) => setDuration(e.target.value)}
        />

      <div className='w-100'>
      <label class="flex flex-row justify-between cursor-pointer pt-7">
      <p className="text-md font-bold ps-0" style={{color: "rgba(255,255,255,.85)"}}>Enable Free Trials</p>
          <input type="checkbox" value="" class="sr-only peer"/>
          <div class="ms-5 relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-500"></div>
        </label>
      <input
          placeholder="Number of Days"
          style={{width: '100%'}}
          className="mt-3 text-white border rounded-lg p-2.5 bg-transparent border-zinc-700"
         
        />
        </div>


        </div>


        <p className="text-md font-bold pt-7 ps-0" style={{color: "rgba(255,255,255,.85)"}}>Price in Matic*</p>
        <input
          placeholder="Asset Price in Eth"
          className="mt-3 text-white border rounded-lg p-2.5 bg-transparent border-zinc-700"
          onChange={(e) => setPrice(e.target.value)}
        />
        <div className='flex flex-row justify-between'>
        <p className="text-md font-bold pt-7 ps-0" style={{color: "rgba(255,255,255,.85)"}}>Quantity Available*</p>
        <div className='pt-7'>
        <label class="inline-flex items-center cursor-pointer">
        <span class="ms-3 text-sm font-bold text-gray-900 dark:text-gray-300 me-3">Unlimited</span>
          <input type="checkbox" value="" class="sr-only peer"/>
          <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-500"></div>
        </label>
        </div>
        </div>

        <input
          placeholder="Quantity"
          className="mt-3 text-white border rounded-lg p-2.5 bg-transparent border-zinc-700"
          onChange={(e) => setQuantity(e.target.value)}
        />

<div className={`w-100 ${paymentOption == 'subscription' ? 'visible' : 'hidden'}`}>

      <div className='w-100'>
      <label class="flex flex-row justify-between cursor-pointer pt-7">
      <p className="text-md font-bold ps-0" style={{color: "rgba(255,255,255,.85)"}}>Automatic Recurring Renewals (For Subscriptions)</p>
      <input type="checkbox" value="" class="sr-only peer" checked/>
      <div class="ms-5 relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-500"></div>
      </label>
      </div>
      <p className="text-[15.5px] ps-0 pt-7" style={{color: "rgba(255,255,255,.65)"}}>*NFTI uses a open-sourced membership protocol called Unlock to create NFTs. You have full freedom to edit the membership terms after creation by going to: https://app.unlock-protocol.com/locks and connecting your wallet. Please note that NFTI writes a 1.5% platform fee into the membership contract, and while you have the freedom to edit this fee percentage at: https://app.unlock-protocol.com/locks, NFTI checks for this platform transaction fee before each transaction on your membership, and changing this platform fee in the contract will cause transactions to be halted for your membership on the NFTI platform.</p>
      </div>

      </div>


      <div className='flex flex-col w-1/2 ps-20'>
      <p className="text-md font-bold pt-0" style={{color: "rgba(255,255,255,.85)"}}>Asset*</p>
      <div className='w-100 aspect-square'>
      <div class="pt-2 flex pt-3 pb-18 w-full aspect-square">
        {fileTempURL ? 
        <img className="w-full aspect-square rounded-lg" src={fileTempURL}/>:
    <label for="dropzone-file" class="flex flex-col items-center justify-center w-full aspect-square border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
        </div>
        <input id="dropzone-file" type="file" name="Asset" class="hidden" onChange={(e) => {
          setFileTempURL(URL.createObjectURL(e.target.files[0]));
          setFile(e.target.files[0])}}/>
    </label>
}
</div> 
</div>

        </div>
      </div>
    </div>
    <div className='flex flex-row justify-end sticky bottom-5 right-0 z-50 w-100 ms-0 me-10' style={{background: "transparent", borderTopWidth: 0, borderColor: "rgba(255,255,255, .075)"}}>
      <div className='flex flex-row justify-end w-1/2'>
      <div class="flex flex-row justify-end w-1/2 mb-3 ms-16">
    <button onClick={
      sendFileToIPFS
      } className="col-start-1 row-start-1 font-bold mt-4 w-full bg-purple-500 text-white rounded-lg p-4 shadow-lg z-1">
          Create NFT
        </button>
        <div className='w-100 h-100 hidden z-5 col-start-1 row-start-1 w-100 rounded-lg p-4 mt-4' style={{backgroundColor: 'rgba(0,0,0,.5)', zIndex: 5}}>
        </div>
        </div>
        </div>
    </div>
    </div>
  )
}