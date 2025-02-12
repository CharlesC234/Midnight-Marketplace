import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { useAddress } from "@thirdweb-dev/react";
import {
  ConnectWallet,
  darkTheme,
} from "@thirdweb-dev/react";
import { useEffect } from "react";
import { useState } from "react";
import { createThirdwebClient } from "thirdweb";
import { RiAccountCircleLine } from "react-icons/ri";
import { MdOutlineAccountCircle } from "react-icons/md";

const client = createThirdwebClient({
    clientId: "61af56a553ebe735e4484ab2c045c57c",
  });

  import {
    ThirdwebProvider,
    ConnectButton,
  } from "thirdweb/react";

  import {
    createWallet,
    walletConnect,
    inAppWallet,
  } from "thirdweb/wallets";
  
  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    walletConnect(),
    inAppWallet({
      auth: {
        options: [
          "email",
          "google",
          "apple",
          "facebook",
          "phone",
        ],
      },
    }),
  ];


export default function ConnectWalletFunc() {
    const [wallet, setwallet] = useState(null);

    // useEffect(() => {
    //   if(address && wallet == null){
    //     setwallet(address);
    //   }
    //   console.log(wallet);
    // })
  
    return       <div className="flex flex-row mt-6 rounded-xl border-0 border-purple-600 whitespace-nowrap px-[19px] text-bold font-bold">
    <ConnectButton
    client={client}
    wallets={wallets}
    theme={darkTheme({
      colors: {
        accentText: "#a855f7",
        accentButtonBg: "#a855f7",
        primaryButtonBg:"rgba(0, 0, 0, 0)",
        primaryButtonText: "#9ca3af",
      },
    })}
    connectButton={{
      label: <div className="fixed mt-[14px] ms-[24px] flex flex-row">
      <MdOutlineAccountCircle style={{color: "#9ca3af", fontSize: '31px'}}/>
      <p className='underline decoration-2 my-auto ms-3 underline-offset-2'>Sign In / Sign Up</p>
      </div>
    }}
    connectModal={{ size: "wide" }}
  />
  </div>
}