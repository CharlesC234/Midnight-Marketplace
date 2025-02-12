/* pages/_app.js */
import '../styles/globals.css'
import Link from 'next/link'
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { useAddress } from "@thirdweb-dev/react";
import { useState } from 'react';
import ConnectWalletFunc from './components/connect-wallet';
import {
  ThirdwebProvider,
  ConnectButton,
} from "thirdweb/react";
import { ThirdwebSDKProvider } from "@thirdweb-dev/react";
// import {
//     QueryClientProvider,
//     QueryClient,
//   } from "@tanstack/react-query";
import { FaCartShopping } from "react-icons/fa6";
import { AiOutlineShop } from "react-icons/ai";
import { IoWallet } from "react-icons/io5";
import { FaChartLine } from "react-icons/fa";
import { MdOutlineAddBox } from "react-icons/md";
import { MdAddToPhotos } from "react-icons/md";
import { LuSquareCode } from "react-icons/lu";
import { AiFillInfoCircle } from "react-icons/ai";
import { FaChartColumn } from "react-icons/fa6";
import { LuWalletCards } from "react-icons/lu";
import { FaCode } from "react-icons/fa6";
import { RiAddCircleLine } from "react-icons/ri";
import { LuInfo } from "react-icons/lu";
import { IoStatsChart } from "react-icons/io5";
import { IoAddCircleOutline } from "react-icons/io5";
import { CgAdd } from "react-icons/cg";
import { IoAdd } from "react-icons/io5";
import { IoBagAddOutline } from "react-icons/io5";
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdAddCircleOutline } from "react-icons/md";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { WagmiProvider, createConfig} from 'wagmi'
import { http} from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { FaCloudMoon } from "react-icons/fa";
import { PiShoppingCartBold } from "react-icons/pi";
import { usePathname } from 'next/navigation'
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { LuShieldCheck } from "react-icons/lu";
import { FiShield } from "react-icons/fi";


const config = createConfig({
    chains: [mainnet, sepolia],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  })
  



function MyApp({ Component, pageProps }) {
  const pathname = usePathname();
  console.log(pathname);
  return (
    <div className='h-full' style={{background: '#030303'}}>
    <ThirdwebProvider>



<nav className={`fixed top-0 z-2 pt-7 w-full bg-white border-b border-gray-700 pb-5 ${pathname ? pathname.substring(1) == 'my-nfts' || pathname.substring(1) == 'create-listing' || pathname.substring(1) == 'cart' ? "hidden" : "visible" : "visible"}`} style={{zIndex: 2, backgroundColor: '#030303', borderColor: 'rgba(255,255,255,0)'}}>
  <div class="px-3 pb-0 lg:px-5 lg:pl-0">
    <div class="flex items-center justify-between ms-[320px]">
      <div className='flex flex-row h-full justify-start w-full me-8'>
      {/* <input className='w-5/12 my-auto rounded-xl' style={{backgroundColor: '#111111', height: '50px', borderWidth: 1.5, borderColor: 'rgba(255,255,255, .15)'}}/> */}


<form class="w-5/12 my-auto">   
    <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
    <div class="relative">
        <div class="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
        </div>
        <input style={{backgroundColor: '#1b1b1b', height: '50px', borderWidth: 0, borderColor: 'rgba(255,255,255, .15)'}} type="search" id="default-search" class="block w-full p-4 ps-12 text-md text-gray-900 border border-gray-300 rounded-xl bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search For Nfts"/>
    </div>
</form>


      {/* <button className="px-5 font-semibold py-3 px-0 rounded-xl ms-3 text-gray-300" style={{backgroundColor: '#111111', height: '50px', borderWidth: 1.5, borderColor: 'rgba(255,255,255, .15)'}}>Search</button> */}
      <div className='flex flex-row w-7/12 overflow-x-auto h-[50px] no-scrollbar ms-2 me-0 z-0'>
      <button className="font-semibold py-3 px-0 h-[50px] rounded-xl ms-0 text-gray-300 px-5 whitespace-nowrap" style={{backgroundColor: '#1b1b1b', borderWidth: 0, borderColor: 'rgba(255,255,255, .15)'}}>Popular</button>
      <button className="font-semibold py-3 px-0 h-[50px] rounded-xl ms-2 text-gray-300 px-5 whitespace-nowrap" style={{backgroundColor: '#1b1b1b', borderWidth: 0, borderColor: 'rgba(255,255,255, .15)'}}>Subscriptions</button>
      <button className="font-semibold py-3 px-0 h-[50px] rounded-xl ms-2 text-gray-300 px-5 whitespace-nowrap" style={{backgroundColor: '#1b1b1b', borderWidth: 0, borderColor: 'rgba(255,255,255, .15)'}}>One Time Purchases</button>
      <button className="font-semibold py-3 px-0 h-[50px] rounded-xl ms-2 text-gray-300 px-5 whitespace-nowrap" style={{backgroundColor: '#1b1b1b', borderWidth: 0, borderColor: 'rgba(255,255,255, .15)'}}>Resells</button>
      <button className="font-semibold py-3 px-0 h-[50px] rounded-xl ms-2 text-gray-300 px-5 whitespace-nowrap" style={{backgroundColor: '#1b1b1b', borderWidth: 0, borderColor: 'rgba(255,255,255, .15)'}}>Popular</button>
      <button className="font-semibold py-3 px-0 h-[50px] rounded-xl ms-2 text-gray-300 px-5 whitespace-nowrap" style={{backgroundColor: '#1b1b1b', borderWidth: 0, borderColor: 'rgba(255,255,255, .15)'}}>High Quantity</button>
      <button className="font-semibold py-3 px-0 h-[50px] rounded-xl ms-2 text-gray-300 px-5 whitespace-nowrap" style={{backgroundColor: '#1b1b1b', borderWidth: 0, borderColor: 'rgba(255,255,255, .15)'}}>Low Quantity</button>
      </div>
      </div>

      <div className='absolute right-0 flex flex-row me-8 z-5'>
      <div className='z-5 w-[175px] bg-gradient-to-r from-transparent to-[#030303] h-[50px]'></div>
      </div>
    </div>
  </div>
</nav>

<aside id="logo-sidebar" class="fixed top-0 left-0 z-40 w-[275px] h-screen pt-0 transition-transform -translate-x-full bg-black sm:translate-x-0" aria-label="Sidebar">
   <div class="flex flex-col justify-between h-full px-0 pb-4 overflow-y-auto bg-black" style={{backgroundColor: 'rgba(255,255,255,.05)', borderRightWidth:2, borderRightColor: 'rgba(255,255,255,.06)'}}>
      <ul class="space-y-2.5 font-medium mt-8">
        <li className='mb-3 mb-7'>
        <a href="/" class="flex ms-5">
        <FaCloudMoon style={{color: '#9333ea', fontSize: '39px'}}/>
          <p class="px-3 self-center font-bold sm:text-2xl whitespace-nowrap dark:text-white text-3xl" style={{fontSize: '28px', opacity: .875}}>Midnight</p>
        </a>
        </li>
         <li style={{borderLeftWidth: 2.5, borderRightWidth: 0, borderColor: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, .3)'}}>
            <a href="/" class="px-4 flex items-center p-2.5 text-purple-600 dark:hover:bg-gray-700 group">
               <AiOutlineShop style={{color: "#9333ea", fontSize: '28px'}}/>
               <span class="ms-3">Marketplace</span>
            </a>
         </li>
         <li>
            <a href="/cart" class="px-[19px] flex items-center p-2.5 pe-2 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
               <PiShoppingCartBold style={{color: "#9ca3af", fontSize: '27px'}}/>
               <span class="flex-1 ms-3.5 whitespace-nowrap text-gray-400">Cart</span>
               <span class="inline-flex items-center justify-center h-4 p-4 ms-3 text-sm font-semibold text-[#9333ea] rounded-lg my-auto whitespace-nowrap" style={{backgroundColor: 'rgba(124, 58, 237, .35)'}}>3 Items</span>
            </a>
         </li>
         <li>
            <a href="/my-nfts" class="px-5 flex items-center p-2.5 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <LuWalletCards style={{color: "#9ca3af", fontSize: '26px'}}/>
               <span class="flex-1 ms-3 whitespace-nowrap text-gray-400">My NFTs</span>
            </a>
         </li>
         <li>
            <a href="/create-listing" class="px-[18px] flex items-center p-2.5 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <MdAddCircleOutline style={{color: "#9ca3af", fontSize: '31px'}}/>
               <span class="flex-1 ms-[10px] whitespace-nowrap text-gray-400 mb-.5">Create New Listing</span>
            </a>
         </li>
         <li>
            <a href="/docs" class="px-5 flex items-center p-2.5 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <FaCode style={{color: "#9ca3af", fontSize: '27px'}}/>
               <span class="flex-1 ms-[13.5px] whitespace-nowrap text-gray-400">Developer Docs</span>
            </a>
         </li>
         <li>
            <a href="/about" class="px-5 flex items-center p-2.5 pb-0 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <LuInfo style={{color: "#9ca3af", fontSize: '28px'}}/>
               <span class="flex-1 ms-3 whitespace-nowrap text-gray-400">About</span>
            </a>
         </li>
         {/* <li>
            <a href="/privacy-policy" class="px-5 flex items-center p-2.5 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <MdOutlinePrivacyTip style={{color: "#9ca3af", fontSize: '28px'}}/>
               <span class="flex-1 ms-3 whitespace-nowrap text-gray-400">Privacy Policy</span>
            </a>
         </li> */}
         <li>
            <a href="/terms-of-service" class="px-[19px] flex items-center p-4 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <LuShieldCheck style={{color: "#9ca3af", fontSize: '30px'}}/>
               <span class="flex-1 ms-3 whitespace-nowrap text-gray-400">Legal</span>
            </a> 
         </li>
         </ul>
         <ul class="space-y-3 font-medium mt-7 mb-3">
         <li>
        <ConnectWalletFunc/>
        </li>

      </ul>
   </div>
</aside>

<div className='ms-[320px] mt-0'>
<Component {...pageProps} />
</div>


{/* 
      <nav style={{borderBottomWidth: 1, borderColor: "rgba(255,255,255, .09)", paddingBottom:15, paddingTop: 25}} className="mx-3 flex flex-row justify-between">
        <p className="text-3xl font-bold my-auto" style={{color: "rgba(255,255,255,.95)"}}>NFTI Marketplace</p>
        <div className="flex my-auto">
          <Link href="/" className='my-auto'>
            <p className="mr-8 text-md font-bold underline decoration-2 underline-offset-[13px] decoration-purple-600" style={{color: "rgba(255,255,255,.85)"}}>
              Explore
            </p>
          </Link>
          <Link href="/create-listing" className='my-auto'>
            <p className="mr-8 text-md font-bold" style={{color: "rgba(255,255,255,.85)"}}>
              Create NFT Listing
            </p>
          </Link>
          <Link href="/my-nfts" className='my-auto'>
            <p className="mr-8 text-md font-bold" style={{color: "rgba(255,255,255,.85)"}}>
              My Owned NFTs
            </p>
          </Link>
          <Link href="/dashboard" className='my-auto'>
            <p className="text-md font-bold" style={{color: "rgba(255,255,255,.85)"}}>
              Creator Dashboard
            </p>
          </Link>
        </div>
        <div className='my-auto'>
        <ConnectWalletFunc/>
        </div>
      </nav> */}


    </ThirdwebProvider>
    </div>
  )
}

export default MyApp