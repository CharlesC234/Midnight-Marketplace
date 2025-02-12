import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import { usePathname } from 'next/navigation'
import {
  marketplaceAddress
} from '../config'
import LOCKMarketplace from '../artifacts/contracts/LOCKMarketplace.sol/LOCKMarketplace.json'
import { useActiveAccount, useActiveBalance, useActiveWallet, useWalletInfo, useReadContract} from "thirdweb/react";
import { getContract } from "thirdweb";
import { createThirdwebClient } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { SiPolygon } from "react-icons/si";



const fetchTransactions = async (contractAddress) => {
  const POLYGONSCAN_API_KEY = 'T6Y13KYBUG83JN1WQRAXNSY4PGIMDACQ4Q';
  const url = `https://api.polygonscan.com/api?module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${POLYGONSCAN_API_KEY}`;

  try {
    const response = await axios.get(url);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching transaction data:", error);
    return [];
  }
};


function convertTimestampToDate(timestamp) {
  // Convert the timestamp from seconds to milliseconds
  const date = new Date(timestamp * 1000);

  // Get date components
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  // Format the date as needed
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return formattedDate;
}



export default function MyAssets() {
  const router = useRouter();
  const [nft, setNft] = useState("");
  const pathname = usePathname();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const account = useActiveAccount();
  const walletAddress = account?.address;
  const [NFTID, setNFTID] = useState("0");

  const [dataNew, setDataNew] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [screenWidth, setScreenWidth] = useState(null);
  const breakWidth = 1700;


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

  async function getTransactionData(addr){
    const transactionData = await fetchTransactions(addr);
    console.log("trans data: " + addr + JSON.stringify(transactionData));
    setTransactionHistory(transactionData);
  }

  function useScreenWidth() {
  
      // Function to update the screen width
      const updateWidth = () => setScreenWidth(window.innerWidth);
  
      // Set the initial width
      updateWidth();
  
      // Add event listener to update the width on resize
      window.addEventListener('resize', updateWidth);
  
      // Cleanup event listener on component unmount
      return () => window.removeEventListener('resize', updateWidth);
  }



    const { data, isLoading } = useReadContract({
      contract,
      method: "viewLockDetails",
      params: [NFTID]
    });
    if(dataNew == null && data != null){
    setDataNew(data);
    }
    if(dataNew && nft == ""){
      loadNFT(NFTID);
    }


  useEffect(() => {
    useScreenWidth();
    console.log("screenwidth: " + screenWidth);
    if(pathname != null){
    setNFTID(pathname.substring(1));
    }
  }, [pathname])

  async function loadNFT(ID) {
    /* create a generic provider and query for unsold market items */

      const tokenUri = dataNew.tokenUri;
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(dataNew.keyPrice.toString(), 'ether')
      getTransactionData(ID);
      let item = {
        originalOwner: dataNew.originalOwner,
        address: ID,
        price,
        seller: dataNew.seller,
        owner: dataNew.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
        quantity: dataNew.maxKeys.toString(),
        length: dataNew.expirationDuration.toString()
      }
      setNft(item);
    // setLoadingState('loaded') 
  }


  //fake data REPLACE 
  const fakeTags = ["Art", "AcidTrip", "One Time Buy", "LSD"];
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


  return (
    <div className='flex flex-col h-auto me-12'>
    <div className="flex flex-col container grow h-auto mb-0" style={{color: '#121212',}}>
       <div className='flex flex-row mt-20'>
      <div className="flex flex-col pb-0 ps-0" style={{width: '47.5%'}}>
        <img className='w-full aspect-square rounded-3xl bg-[#1b1b1b]' src={"https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.20.30+PM.png"}/>
      </div>


      <div className='flex flex-col ms-4 pb-4 h-auto' style={{width: '52.5%'}}>
        <div className='flex flex-col w-full rounded-3xl m-0 h-auto' style={{backgroundColor: '#181818'}}>
          <div className='flex flex-col justify-between h-full w-full'>
            <div className='flex flex-col w-full ps-5 pe-5'>
          <div className='flex flex-row justify-between pt-5 pb-6' style={{borderBottomWidth: 2, borderBottomColor: 'rgba(255,255,255,.08)'}}>
          <p className='text-4xl text-gray-200 font-semibold'>{nft.name}</p>
          <SiPolygon className='my-auto me-5' style={{color: '#7c3aed', fontSize: '30px'}}/>
          </div>
          <div className='flex flex-row w-100'>
          <div className='flex flex-row w-full justify-center pt-4 pe-5 pb-4' style={{borderBottomWidth: 2, borderBottomColor: 'rgba(255,255,255,.08)'}}>
          <div className='flex flex-col w-1/3 pe-0' style={{borderRightWidth: 2, borderRightColor: 'rgba(255,255,255,.085)'}}>
          <p className='text-md ps-0 text-gray-400 font-semibold'>Payment Style*</p>
          <p className='text-md pt-0 ps-0 text-gray-200 font-semibold'>{nft.length == "12121311" ? "One time payment" : `Subscription ${nft.length} days`}</p>
          </div> 
          <div className='flex flex-col w-1/3 pe-4' style={{borderRightWidth: 2, borderRightColor: 'rgba(255,255,255,.08)'}}>
          <p className='text-md ps-5 text-gray-400 font-semibold'>Quantity</p>
          <p className='text-md pt-0 ps-5 text-gray-200 font-semibold '>{nft.quantity == "115792089237316195423570985008687907853269984665640564039457584007913129639935" ? "Unlimited" : nft.quantity}</p>
          </div> 
          <div className='flex flex-col w-1/3 pe-4'>
          <p className='text-md ps-5 text-gray-400 font-semibold'>Seller</p>
          <a href={`https://polygonscan.com/address/${nft.originalOwner}`} className='underline ps-5 text-md pt-0 text-[#7c3aed] truncate pe-7'>{nft.originalOwner}</a>
          {/* <p className='text-md ps-5 pt-0 text-gray-200 font-semibold truncate'>{nft.originalOwner}</p> */}
          </div> 
          </div>
          </div>
          {/* <div className='flex flex-row justify-between ps-5'>
            <div>
            <p className='text-lg pt-3 text-gray-200 font-semibold'>Quantity</p>
            <p className='text-lg pt-0 text-gray-400 font-semibold'>{nft.quantity == "115792089237316195423570985008687907853269984665640564039457584007913129639935" ? "Unlimited" : nft.quantity}</p>
            </div>
            <div className='pe-44'>
            <p className='text-lg ps-5 pt-3 text-gray-200 font-semibold'>Payment Style</p>
            <p className='text-lg pt-0 text-gray-400 font-semibold'>{nft.length == "12121311" ? "One time payment" : `Subscription, payments will recurr every ${nft.length} days`}</p>
            </div>
          </div> */}
          <p className='text-md pt-5 text-gray-400 font-semibold mb-2'>Price - USD Constant</p>
          <div className='flex flex-row'>
          <p className='ms-0 text-3xl text-gray-200 font-semibold pe-10' style={{borderRightWidth: 2, borderRightColor: 'rgba(255, 255, 255, .08)'}}>$5 USD</p>
          <p className='ms-10 text-3xl pt-0 text-gray-200 font-semibold'>{nft.price} Matic</p>
          </div>
          </div>
          <div className='flex flex-row pt-4 w-full justify-between ps-5 pb-6 z-0' style={{zIndex: 0}}>
            <button className='rounded-xl py-3 w-2/3 border-0 text-[#7c3aed] text-[18px] font-bold me-3' style={{borderWidth: 2, opacity: .9, borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, .24)'}}>Buy Now</button>
            <button className='rounded-xl me-5 py-3 w-1/3 text-[#7c3aed] text-[18px] font-bold' style={{borderWidth: 2, opacity: .9, borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, .24)'}}>Add To Cart</button>
          </div>
          </div>
        </div>
        {/* <div className='flex flex-col w-full rounded-2xl m-0 h-1/3 mt-4' style={{backgroundColor: '#1f1f1f'}}>
        </div> */}
        <div className='flex flex-row w-full rounded-3xl h-auto'>
        <div className='flex flex-col ps-5 pe-5 w-1/2 rounded-3xl m-0 h-auto mt-4 pb-5' style={{backgroundColor: '#181818'}}>
        <div className='flex flex-col justify-between pt-6 pb-4' style={{borderBottomWidth: screenWidth > breakWidth ? 2 : 0, borderBottomColor: 'rgba(255,255,255,.08)'}}>
          <p className='text-md text-gray-400 font-semibold'>Description</p>
          <p className='text-md pt-0 text-gray-200 font-semibold'>{nft.description}</p>
          </div>
          {screenWidth > breakWidth ? 
          <>
          <div className='flex flex-col justify-between pt-4 pb-4' style={{borderBottomWidth: 2, borderBottomColor: 'rgba(255,255,255,.08)'}}>
          <p className='text-md text-gray-400 font-semibold'>Website</p>
          <a className='text-md pt-0 text-[#7c3aed] underline'>https://charlescahill.dev</a>
          </div>
          <p className='text-md text-gray-400 font-semibold pt-5'>Tags</p>
          <div className='flex flex-wrap mt-2'>
          {fakeTags.map((item, index) => {
            return <div className='text-md me-2 mb-2 font-semibold text-[#7c3aed] px-5 py-2 rounded-xl whitespace-nowrap' style={{borderWidth: 2, opacity: .8, borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, .24)'}}>{item}</div>
          })}
          </div>
          </>
          :
          <></>}
        </div>
        <div className='flex flex-col ps-5 pe-5 w-1/2 rounded-3xl m-0 h-auto ms-4 mt-4 pb-5' style={{backgroundColor: '#181818'}}>
        <div className='flex flex-col justify-between pt-6 pb-4' style={{borderBottomWidth: 2, borderBottomColor: 'rgba(255,255,255,.08)'}}>
          <p className='text-md text-gray-400 font-semibold'>Contract Address</p>
          <a href={`https://polygonscan.com/address/${nft.address}`} className='underline text-md pt-0 text-[#7c3aed] truncate pe-32'>{nft.address}</a>
          </div>
          <div className='flex flex-col justify-between pt-4 pb-4' style={{borderBottomWidth: screenWidth > breakWidth ? 2 : 0, borderBottomColor: 'rgba(255,255,255,.08)'}}>
          <p className='text-md text-gray-400 font-semibold'>Date Listed</p>
          <p className='text-md pt-0 text-gray-200 font-semibold'>May 8th 2024</p>
          </div>
          {screenWidth > breakWidth ? <>
          <div className='flex flex-col justify-between pt-4 pb-4' style={{borderBottomWidth: 2, borderBottomColor: 'rgba(255,255,255,.08)'}}>
          <p className='text-md text-gray-400 font-semibold'>Amount Sold</p>
          <p className='text-md pt-0 text-gray-200 font-semibold'>20</p>
          </div>
          <div className='flex flex-col justify-between pt-4 pb-4'>
          <p className='text-md text-gray-400 font-semibold'>Midnight Market ID</p>
          <p className='text-md pt-0 text-gray-200 font-semibold'>1</p>
          </div>
          </> : <></>}
        </div>
        </div>
        </div>
      </div>
      {screenWidth < breakWidth? 
      <div className='flex flex-row mt-0 ps-0 me-0 rounded-3xl ps-5 pt-2.5 pb-2.5' style={{backgroundColor: '#181818'}}>
          <div className='flex flex-col justify-between pt-2 pb-2 mt-2 mb-2 pe-7' style={{borderRightWidth: 2, borderRightColor: 'rgba(255,255,255,.08)'}}>
          <p className='text-md text-gray-400 font-semibold'>Website</p>
          <a className='text-md pt-0 text-[#7c3aed] underline'>https://charlescahill.dev</a>
          </div>
          <div className='flex flex-col justify-between pt-2 pb-2 mt-2 mb-2 ms-7 pe-7' style={{borderRightWidth: 2, borderRightColor: 'rgba(255,255,255,.08)'}}>
          <p className='text-md text-gray-400 font-semibold'>Amount Sold</p>
          <p className='text-md pt-0 text-gray-200 font-semibold'>20</p>
          </div>
          <div className='flex flex-col justify-between pt-2 pb-2 mt-2 mb-2 ms-7 pe-7' style={{borderRightWidth: 2, borderRightColor: 'rgba(255,255,255,.08)'}}>
          <p className='text-md text-gray-400 font-semibold'>Midnight Market ID</p>
          <p className='text-md pt-0 text-gray-200 font-semibold'>1</p>
          </div>
          <div className='flex flex-col justify-between pt-2 pb-2 mt-2 mb-0 ms-7 pe-7'>
          <p className='text-md text-gray-400 font-semibold'>Tags</p>
          <div className='flex flex-wrap mt-1'>
          {fakeTags.map((item, index) => {
            return <div className='text-md me-2 font-semibold text-gray-300 px-5 py-2 rounded-xl whitespace-nowrap' style={{borderWidth: 0, opacity: .9, borderColor: '#7c3aed', backgroundColor: 'rgba(255,255,255,.11)'}}>{item}</div>
          })}
          </div>
          </div>
      </div>
      : <></> }
      <div className='flex flex-col ps-0 me-0 rounded-3xl ps-5 pt-5 pb-5' style={{backgroundColor: '#181818', marginTop: screenWidth > breakWidth ? 0 : 5}}>
      <h1 className='text-gray-400 text-lg font-bold mb-4'>Contract History - {transactionHistory.length} {transactionHistory.length == 1 ? "Transaction": "Transactions"} Total</h1>
      <div className='flex flex-row pe-5 w-full'>
      {transactionHistory.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul className='w-full'>
            <li className='flex flex-row w-100 pb-3 justify-between' style={{borderBottomWidth: 2, borderBottomColor: 'rgba(255,255,255,.085)'}}>
              <p className='text-gray-400 w-2/12 font-bold'>Hash</p>
              <p className='text-gray-400 w-3/12 font-bold'>Date</p>
              <p className='text-gray-400 w-2/12 font-bold'>From</p>
              <p className='text-gray-400 w-2/12 font-bold'>To</p>
              <p className='text-gray-400 w-1/12 font-bold'>Value</p>
              <p className='text-gray-400 w-2/12 font-bold'>Block Number</p>
            </li>
          {transactionHistory.slice(0,5).map((tx) => (
            <li className='flex flex-row w-100 pb-3 pt-3 justify-between' style={{borderBottomWidth: 2, borderBottomColor: 'rgba(255,255,255,.085)'}} key={tx.hash}>
              <a href={`https://polygonscan.com/tx/${tx.hash}`} className='text-[#7c3aed] underline w-2/12 truncate pe-10'>{tx.hash}</a>
              <p className='text-gray-400 w-3/12 truncate pe-0'>{convertTimestampToDate(tx.timeStamp)}</p>
              <p href={`https://polygonscan.com/address/${tx.from}`} className='text-[#7c3aed] underline w-2/12 truncate pe-10'>{tx.from}</p>
              <p href={`https://polygonscan.com/address/${tx.to}`} className='text-[#7c3aed] underline w-2/12 truncate pe-10'>{tx.to}</p>
              <p className='text-gray-400 w-1/12 truncate pe-5'>{tx.value} Matic</p>
              <p href={`https://polygonscan.com/block/${tx.blockNumber}`} className='text-[#7c3aed] underline w-2/12 truncate pe-0'>{tx.blockNumber}</p>
            </li>
          ))}
        </ul>
      )}</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 mb-32">
          {
            newNfts.slice(0,8).map((nft, i) => (
              <a key={i} href={nft.address} className="rounded-3xl overflow-hidden" style={{backgroundColor: '#181818'}}>
                <div className='p-0 aspect-square mb-4'>
                <div className='overflow-hidden' style={{height: '85%'}}>
                <img className='w-100' src={nft.image} />
                </div>
                <div className="w-100 flex flex-row px-5 pt-3 mb-5">
                  <div className='w-9/12 flex flex-col'>
                  <p className="text-[21px] font-bold max-w-7/12 truncate me-3" style={{color: "rgba(255,255,255, .9)"}}>{nft.name}</p>
                  <div className='flex flex-row mt-0'>
                  <p className="text-[15px] font-semibold ms-0" style={{color: "rgba(255,255,255, .7)"}}>{nft.price} Matic -</p>
                  <p className="text-[15px] font-semibold ms-2" style={{color: "rgba(255,255,255, .7)"}}> $12</p>
                  </div>
                  </div>
                <button className="mt-1 w-3/12 min-w-16 text-[#7c3aed] font-bold py-1.5 px-auto rounded-xl" style={{borderWidth: 2, opacity: .9, borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, .24)'}}>Buy</button>
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