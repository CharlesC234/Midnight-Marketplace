import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import {
  marketplaceAddress
} from '../config'
import { useRouter } from 'next/navigation';
import LOCKMarketplace from '../artifacts/contracts/LOCKMarketplace.sol/LOCKMarketplace.json'
import { useActiveAccount, useActiveBalance, useActiveWallet, useWalletInfo, useReadContract} from "thirdweb/react";
import { getContract } from "thirdweb";
import { createThirdwebClient } from "thirdweb";
import { polygon } from "thirdweb/chains";


export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const account = useActiveAccount();
  const [dataNew, setDataNew] = useState(null);
  // const wallet = useActiveWallet();
  // const walletInfo = useWalletInfo();
  const walletAddress = account?.address;
  // console.log("Account: " + JSON.stringify(account));
  // console.log("Wallet: " + JSON.stringify(wallet));
  // console.log("WalletInfo: " + JSON.stringify(walletInfo));


  // const fetchNFTs = async () => {
  //   // Initialize the Thirdweb SDK
  //   const sdk = new ThirdwebSDK("polygon"); // You can change the network to your desired one

  //   // Get the marketplace contract instance
  //   const marketplace = await sdk.getMarketplace(marketplaceAddress);

  //   try {
  //     // Fetch all listings in the marketplace
  //     const listings = await marketplace.getAllListings();
  //     setNfts(listings);
  //   } catch (error) {
  //     console.error("Error fetching NFTs:", error);
  //   }
  // };
  const client = createThirdwebClient({
    clientId: "61af56a553ebe735e4484ab2c045c57c",
    secretKey: "4X79BY1ti5rslVPoTA4_7uNdkqVMdYjiNRNR0JFE7hyju8XPU4RLBBLuhr5YCidKbQsI8BXfgTlU5mgrMmnHxA"
  });
  const contract = getContract({
    client,
    chain: polygon,
    address: marketplaceAddress,
    abi: LOCKMarketplace.abi
  });


  console.log(contract);
    const { data, isLoading } = useReadContract({
          contract,
          method: "viewLocks",
        });
    console.log(data);
    if(dataNew == null && data != null){
      setDataNew(data);
    }
   

  if(dataNew && nfts.length < 1){
    loadNFTs();
  }


  console.log("nfts: " + nfts)

  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    console.log(marketplaceAddress);
    console.log("logging")
    // const contract = new ethers.Contract(marketplaceAddress, LOCKMarketplace.abi, provider)
    // console.log(contract);

    // const data = useReadContract({
    //   contract,
    //   method: "function viewLocks() public view returns (Lock[] memory)",
    // });

    // const data = await contract.viewLocks();

    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
    const items = await Promise.all(dataNew.map(async i => {
      const tokenUri = i.tokenUri;
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.keyPrice.toString(), 'ether')
      console.log(i.maxKeys.toString());
      let item = {
        address: i.lockAddress,
        price,
        quantity: i.maxKeys.toString(),
        // tokenId: i.tokenId.toNumber(),
        image: meta.data.image,
        name: i.lockName,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }


  // async function buyNft(nft) {
  //   /* needs the user to sign the transaction, so will use Web3Provider and sign it */
  //   const web3Modal = new Web3Modal()
  //   const connection = await web3Modal.connect()
  //   const provider = new ethers.providers.Web3Provider(connection)
  //   const signer = provider.getSigner()
  //   const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)

  //   /* user will be prompted to pay the asking proces to complete the transaction */
  //   const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')   
  //   const transaction = await contract.createMarketSale(nft.tokenId, {
  //     value: price
  //   })
  //   await transaction.wait()
  //   loadNFTs()
  // }
  console.log(JSON.stringify(nfts));

  const newNfts = [
    {
      "address": "0x7G7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c7",
      "price": "8.8",
      "quantity": "2000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.20.02+PM.png",
      "name": "Cyber City",
      "description": "A futuristic cityscape bustling with activity."
    },
    {
      "address": "0x8H7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c8",
      "price": "9.9",
      "quantity": "1000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.20.30+PM.png",
      "name": "Eternal Flame",
      "description": "A mesmerizing depiction of an eternal flame."
    },
    {
      "address": "0x9I7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c9",
      "price": "10.0",
      "quantity": "1100000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.21.00+PM.png",
      "name": "Celestial Dance",
      "description": "Stars and planets in a cosmic ballet."
    },
    {
      "address": "0x0J7264cb15Ef1EbBb55698E63daa0Cb4f43EC6d0",
      "price": "11.5",
      "quantity": "1200000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.22.16+PM.png",
      "name": "Ancient Wisdom",
      "description": "Artifacts and symbols from an ancient civilization."
    },
    {
      "address": "0x1A7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c1",
      "price": "3.0",
      "quantity": "5000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.08.00+PM.png",
      "name": "Mystic Falls",
      "description": "A serene depiction of a waterfall in the mountains."
    },
    {
      "address": "0x2B7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c2",
      "price": "7.5",
      "quantity": "3000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.08.26+PM.png",
      "name": "Digital Dawn",
      "description": "An abstract piece illustrating the dawn of the digital age."
    },
    {
      "address": "0x3C7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c3",
      "price": "1.2",
      "quantity": "8000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.10.05+PM.png",
      "name": "Galactic Journey",
      "description": "A journey through the stars and beyond."
    },
    {
      "address": "0x4D7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c4",
      "price": "4.4",
      "quantity": "6000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.21.33+PM.png",
      "name": "Urban Dreams",
      "description": "A glimpse into the future of urban living."
    },
    {
      "address": "0x5E7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c5",
      "price": "2.5",
      "quantity": "9000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.18.52+PM.png",
      "name": "Nature's Harmony",
      "description": "A blend of nature and technology in perfect harmony."
    },
    {
      "address": "0x3347264cb15Ef1EbBb55698E63daa0Cb4f43EC6c",
      "price": "5.0",
      "quantity": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.06.59+PM.png",
      "name": "A Trip Down Memory Lane",
      "description": "Test"
    },
    {
      "address": "0x6F7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c6",
      "price": "6.0",
      "quantity": "7000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.19.28+PM.png",
      "name": "Ocean Bliss",
      "description": "A peaceful scene of the ocean at dawn."
    },
  ];
  const combinedNfts = nfts.concat(newNfts);


  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return (
    <div className="flex justify-center mt-0 me-12 pb-20">
      <div className='mt-[57.5px]' style={{backgroundColor: '#030303'}}>
        <div className='flex flex-row justify-between mt-3'>
        <p className='font-bold text-3xl mb-4'>Featured Listings</p>
        <button className="font-semibold py-3 px-0 h-[50px] rounded-xl ms-0 text-gray-300 px-5 whitespace-nowrap my-auto" style={{backgroundColor: '#1f1f1f', borderWidth: 0, borderColor: 'rgba(255,255,255, .15)'}}>View All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            combinedNfts.map((nft, i) => (
              <a key={i} href={nft.address} className="rounded-3xl overflow-hidden" style={{backgroundColor: '#181818'}}>
                <div className='p-0 aspect-square mb-4'>
                <div className='overflow-hidden' style={{height: '85%'}}>
                <img className='w-100' src={nft.image} />
                </div>
                <div className="w-100 flex flex-row px-5 pt-3 mb-5">
                  <div className='w-8/12 flex flex-col'>
                  <p className="text-[21px] font-bold max-w-7/12 truncate me-3" style={{color: "rgba(255,255,255, .9)"}}>{nft.name}</p>
                  <div className='flex flex-row mt-0'>

                  <p className="text-[15px] font-semibold ms-0" style={{color: "rgba(255,255,255, .7)"}}>{nft.price} Matic - $12</p>
                  </div>
                  </div>
                <button className="mt-1 w-4/12 min-w-16 text-[#7c3aed] font-bold py-1.5 px-auto rounded-xl" style={{borderWidth: 2, opacity: .9, borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, .24)'}}>Buy</button>
                </div>
                </div>
              </a>
            ))
          }
        </div>
      </div>
    </div>
  )
}