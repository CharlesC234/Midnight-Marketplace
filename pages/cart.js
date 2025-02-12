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
    // loadNFTs();
  }


  console.log("nfts: " + nfts)

  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    console.log(marketplaceAddress);
    console.log("logging")

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

  const newNfts = [
    {
      "address": "0x7G7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c7",
      "price": "8.8",
      "originalOwner": "0xCA24562023f16B106C3E008Adc1e815b640D649C",
      "address": "0x3347264cb15Ef1EbBb55698E63daa0Cb4f43EC6c",
      "quantity": "2000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.20.02+PM.png",
      "name": "Cyber City",
      "description": "A futuristic cityscape bustling with activity."
    },
    {
      "address": "0x8H7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c8",
      "price": "9.9",
      "originalOwner": "0xCA24562023f16B106C3E008Adc1e815b640D649C",
      "address": "0x3347264cb15Ef1EbBb55698E63daa0Cb4f43EC6c",
      "quantity": "1000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.20.30+PM.png",
      "name": "Eternal Flame",
      "description": "A mesmerizing depiction of an eternal flame."
    },
    {
      "address": "0x9I7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c9",
      "price": "10.0",
      "originalOwner": "0xCA24562023f16B106C3E008Adc1e815b640D649C",
      "address": "0x3347264cb15Ef1EbBb55698E63daa0Cb4f43EC6c",
      "quantity": "1100000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.21.00+PM.png",
      "name": "Celestial Dance",
      "description": "Stars and planets in a cosmic ballet."
    },
    {
      "address": "0x0J7264cb15Ef1EbBb55698E63daa0Cb4f43EC6d0",
      "price": "11.5",
      "originalOwner": "0xCA24562023f16B106C3E008Adc1e815b640D649C",
      "address": "0x3347264cb15Ef1EbBb55698E63daa0Cb4f43EC6c",
      "quantity": "1200000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.22.16+PM.png",
      "name": "Ancient Wisdom",
      "description": "Artifacts and symbols from an ancient civilization."
    },
    {
      "address": "0x1A7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c1",
      "price": "3.0",
      "originalOwner": "0xCA24562023f16B106C3E008Adc1e815b640D649C",
      "address": "0x3347264cb15Ef1EbBb55698E63daa0Cb4f43EC6c",
      "quantity": "5000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.08.00+PM.png",
      "name": "Mystic Falls",
      "description": "A serene depiction of a waterfall in the mountains."
    },
    {
      "address": "0x2B7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c2",
      "price": "7.5",
      "originalOwner": "0xCA24562023f16B106C3E008Adc1e815b640D649C",
      "address": "0x3347264cb15Ef1EbBb55698E63daa0Cb4f43EC6c",
      "quantity": "3000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.08.26+PM.png",
      "name": "Digital Dawn",
      "description": "An abstract piece illustrating the dawn of the digital age."
    },
    {
      "address": "0x3C7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c3",
      "price": "1.2",
      "originalOwner": "0xCA24562023f16B106C3E008Adc1e815b640D649C",
      "address": "0x3347264cb15Ef1EbBb55698E63daa0Cb4f43EC6c",
      "quantity": "8000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.10.05+PM.png",
      "name": "Galactic Journey",
      "description": "A journey through the stars and beyond."
    },
    {
      "address": "0x4D7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c4",
      "price": "4.4",
      "originalOwner": "0xCA24562023f16B106C3E008Adc1e815b640D649C",
      "address": "0x3347264cb15Ef1EbBb55698E63daa0Cb4f43EC6c",
      "quantity": "6000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.21.33+PM.png",
      "name": "Urban Dreams",
      "description": "A glimpse into the future of urban living."
    },
    {
      "address": "0x5E7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c5",
      "price": "2.5",
      "originalOwner": "0xCA24562023f16B106C3E008Adc1e815b640D649C",
      "address": "0x3347264cb15Ef1EbBb55698E63daa0Cb4f43EC6c",
      "quantity": "9000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.18.52+PM.png",
      "name": "Nature's Harmony",
      "description": "A blend of nature and technology in perfect harmony."
    },
    {
      "address": "0x3347264cb15Ef1EbBb55698E63daa0Cb4f43EC6c",
      "price": "5.0",
      "originalOwner": "0xCA24562023f16B106C3E008Adc1e815b640D649C",
      "address": "0x3347264cb15Ef1EbBb55698E63daa0Cb4f43EC6c",
      "quantity": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.06.59+PM.png",
      "name": "A Trip Down Memory Lane",
      "description": "Test"
    },
    {
      "address": "0x6F7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c6",
      "price": "6.0",
      "originalOwner": "0xCA24562023f16B106C3E008Adc1e815b640D649C",
      "address": "0x3347264cb15Ef1EbBb55698E63daa0Cb4f43EC6c",
      "quantity": "7000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.19.28+PM.png",
      "name": "Ocean Bliss",
      "description": "A peaceful scene of the ocean at dawn."
    },
  ];
  const combinedNfts = newNfts;


  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return (
    <div className="flex justify-start mt-0 me-12 pb-20">
      <div className='mt-[0px] w-full' style={{backgroundColor: '#030303'}}>
        <div className='flex flex-row justify-between mt-0'>
        <p className='font-bold text-3xl mb-4'>Your Cart</p>
        </div>
        <div className='flex flex-row w-full'>
        <div className="flex flex-col w-2/3 mt-3">
          {
            combinedNfts.map((nft, i) => (
              <a key={i} href={nft.address} className="rounded-2xl overflow-hidden mb-4" style={{backgroundColor: '#181818'}}>
                <div className='p-0 flex flex-row mb-0'>
                <div className='overflow-hidden aspect-square w-3/12'>
                <img className='w-full' src={nft.image} />
                </div>
                <div className="w-9/12 flex flex-col justify-between px-5 pt-3 mb-5">
                  <div className='w-full flex flex-row justify-between'>
                  <div className='flex flex-col mt-0 w-3/4'>
                  <p className="text-[27px] font-bold truncate me-3" style={{color: "rgba(255,255,255, .9)"}}>{nft.name}</p>
                    <div className='flex flex-col w-5/12 pe-4 mt-4'>
                    <p className='text-md ps-0 text-gray-400 font-semibold whitespace-nowrap'>Seller:</p>
                    <a href={`https://polygonscan.com/address/${nft.originalOwner}`} className='underline ps-0 text-md pt-0 text-[#7c3aed] truncate pe-7'>{nft.originalOwner}</a>
                    {/* <p className='text-md ps-5 pt-0 text-gray-200 font-semibold truncate'>{nft.originalOwner}</p> */}
                    </div> 
                    <div className='flex flex-col w-5/12 pe-4'>
                    <p className='text-md ps-0 text-gray-400 font-semibold whitespace-nowrap'>Contract Address:</p>
                    <a href={`https://polygonscan.com/address/${nft.address}`} className='underline ps-0 text-md pt-0 text-[#7c3aed] truncate pe-7'>{nft.originalOwner}</a>
                    {/* <p className='text-md ps-5 pt-0 text-gray-200 font-semibold truncate'>{nft.originalOwner}</p> */}
                    </div> 
                  </div>
                  <div className='flex flex-row mt-0'>
                  <p className="text-[27px] font-semibold ms-0 me-2 whitespace-nowrap" style={{color: "rgba(255,255,255, .7)"}}>{nft.price} Matic - $12</p>
                  </div>
                  </div>
                  <div className='flex flex-row pt-4 w-full justify-end ps-0 pb-0 z-0' style={{zIndex: 0}}>
                    {/* <button className='rounded-xl py-3 w-2/3 border-0 text-[#7c3aed] text-[18px] font-bold me-3' style={{borderWidth: 2, opacity: .9, borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, .24)'}}>Buy Now</button> */}
                    <button className='rounded-xl me-1 py-2.5 w-1/3 text-[#7c3aed] text-[18px] font-bold' style={{borderWidth: 2, opacity: .9, borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, .24)'}}>Remove From Cart</button>
                </div>
                </div>
                </div>
              </a>
            ))
          }
        </div>
        <div className="flex flex-col w-1/3 mt-3 ms-4">
        <div className="rounded-2xl mb-4 w-full pb-5 pe-10" style={{backgroundColor: '#181818'}}>
        <p className='font-bold text-3xl mb-3 ms-5 mt-4' style={{color: "rgba(255,255,255, .9)"}}>Subtotal</p>
        <div className='flex flex-row ms-5 mb-5'>
          <p className='ms-0 text-2xl text-gray-200 font-semibold pe-5' style={{borderRightWidth: 2, color: 'rgba(255, 255, 255, .7)', borderRightColor: 'rgba(255, 255, 255, .1)'}}>$5 USD</p>
          <p className='ms-5 text-2xl pt-0 text-gray-200 font-semibold' style={{ color: 'rgba(255, 255, 255, .7)'}}>10 Matic</p>
        </div>
        <button className='rounded-xl py-3 me-5 border-0 text-[#7c3aed] text-[18px] font-bold ms-5' style={{borderWidth: 2, opacity: .9, borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, .24)', width: '100%'}}>Go To Checkout</button>
        </div>
        </div>
        </div>
      </div>
    </div>
  )
}