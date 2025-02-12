import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'

import {
  marketplaceAddress
} from '../config'
import { IoAddCircleOutline } from "react-icons/io5";
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import { IoAdd } from "react-icons/io5";

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const router = useRouter();

  const Listings = [
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
  const Purchases = [
    {
      "address": "0x7G7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c7",
      "price": "8.8",
      "quantity": "2000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.20.02+PM.png",
      "name": "Cyber City",
      "description": "A futuristic cityscape bustling with activity.",
      "length": 12121311
    },
    {
      "address": "0x8H7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c8",
      "price": "9.9",
      "quantity": "1000000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.20.30+PM.png",
      "name": "Eternal Flame",
      "description": "A mesmerizing depiction of an eternal flame.",
      "length": 30
    },
    {
      "address": "0x9I7264cb15Ef1EbBb55698E63daa0Cb4f43EC6c9",
      "price": "10.0",
      "quantity": "1100000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.21.00+PM.png",
      "name": "Celestial Dance",
      "description": "Stars and planets in a cosmic ballet.",
      "length": 30
    },
    {
      "address": "0x0J7264cb15Ef1EbBb55698E63daa0Cb4f43EC6d0",
      "price": "11.5",
      "quantity": "1200000000000000000000000000000000000000000000000000000000000000",
      "image": "https://strapi-aws-s3-images-bucket-aiaesthetica.s3.amazonaws.com/04-24/Screenshot+2024-06-16+at+6.22.16+PM.png",
      "name": "Ancient Wisdom",
      "length": 12121311
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
  ];

  return (
    <div className="flex justify-center mt-0 me-12 pb-20">
      <div className='mt-[0px]' style={{backgroundColor: '#030303'}}>
        <div className='flex flex-row justify-between mt-0'>
        <p className='font-bold text-3xl mb-4'>Purchases</p>
        <button className="font-semibold py-3 px-0 h-[50px] rounded-xl ms-0 text-gray-300 px-5 whitespace-nowrap my-auto" style={{backgroundColor: '#1f1f1f', borderWidth: 0, borderColor: 'rgba(255,255,255, .15)'}}>View All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            Purchases.slice(0,4).map((nft, i) => (
              <a key={i} href={nft.address} className="rounded-3xl overflow-hidden" style={{backgroundColor: '#181818'}}>
                <div className='p-0 aspect-square mb-4'>
                <div className='overflow-hidden' style={{height: '85%'}}>
                <img className='w-100' src={nft.image} />
                </div>
                <div className="w-100 flex flex-col px-5 pt-3 mb-5">
                  <div className='w-100 flex flex-col'>
                  <p className="text-[21px] font-bold truncate me-3 w-100" style={{color: "rgba(255,255,255, .9)"}}>{nft.name}</p>
                  <div className='flex flex-row mt-0'>
                  <p className="text-[15px] font-semibold" style={{color: "rgba(255,255,255, .7)"}}>{nft.price} Matic - $12</p>
                  </div>
                  <div className='flex flex-row mt-0'>
                  <p className="text-[15px] font-semibold" style={{color: "rgba(255,255,255, .7)"}}>Purchased: </p>
                  <p className="text-[15px] font-semibold ms-2" style={{color: "rgba(255,255,255, .7)"}}>2024-06-07 19:36</p>
                  </div>
                  </div>
                <button className="mt-2.5 min-w-16 text-[#7c3aed] font-bold py-2.5 px-auto rounded-xl" style={{borderWidth: 2, opacity: .9, borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, .24)'}}>{nft.length == "12121311" ? "List NFT on Midnight" : `Cancel Subscription`}</button>
                </div>
                </div>
              </a>
            ))
          }
        </div>
        <div className='flex flex-row justify-between mt-10' style={{borderTopWidth: 0, borderTopColor: 'rgba(255,255,255,.125)'}}>
        <p className='font-bold text-3xl mb-4'>Listings</p>
        <button className="font-semibold py-3 px-0 h-[50px] rounded-xl ms-0 text-gray-300 px-5 whitespace-nowrap my-auto" style={{backgroundColor: '#1f1f1f', borderWidth: 0, borderColor: 'rgba(255,255,255, .15)'}}>View All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            Listings.slice(0,3).map((nft, i) => (
              <a key={i} href={nft.address} className="rounded-3xl overflow-hidden" style={{backgroundColor: '#181818'}}>
                <div className='p-0 aspect-square mb-4'>
                <div className='overflow-hidden' style={{height: '85%'}}>
                <img className='w-100' src={nft.image} />
                </div>
                <div className="w-100 flex flex-col px-5 pt-3 mb-5">
                  <div className='w-100 flex flex-col'>
                  <p className="text-[21px] font-bold w-100 truncate me-3" style={{color: "rgba(255,255,255, .9)"}}>{nft.name}</p>
                  <div className='flex flex-row mt-0'>
                  <p className="text-[15px] font-semibold" style={{color: "rgba(255,255,255, .7)"}}>Price:</p>
                  <p className="text-[15px] font-semibold ms-2" style={{color: "rgba(255,255,255, .7)"}}>{nft.price} Matic</p>
                  </div>
                  </div>
                  <div className='flex flex-row'>
                  <button className="me-1 mt-2.5 w-1/2 min-w-16 text-[#7c3aed] font-bold py-2.5 px-auto rounded-xl" style={{borderWidth: 2, opacity: .9, borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, .24)'}}>Remove Listing</button>
                  <button className="ms-1 mt-2.5 w-1/2 min-w-16 text-[#7c3aed] font-bold py-2.5 px-auto rounded-xl" style={{borderWidth: 2, opacity: .9, borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, .24)'}}>Edit Listing</button>
                  </div>
                </div>
                </div>
              </a>
            ))
          }
          <a href={'/create-listing'} className="rounded-3xl overflow-hidden flex flex-col align-center justify-center" style={{borderWidth: 2, opacity: .9, borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, .24)'}}>
          <IoAdd className='my-auto mx-auto' style={{color: "#7c3aed", fontSize: '150px'}}/>
          </a>
        </div>
      </div>
    </div>
  )
}