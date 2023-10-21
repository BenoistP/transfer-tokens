// React

import { LanguageSelector } from "./LanguageSelector";
import { ThemeSwitch } from "./ThemeSwitch";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Avatar } from "./NavbarAvatar";
import { Status } from "./NavbarStatus";

export const Navbar = () => {

  // ---

  return (
      <>
        <div className="navbar bg-base-200 text-neutral rounded-box sticky top-0 opacity-90 shadow-xl z-50">

          <div className="navbar-start">
            <LanguageSelector />
            <ThemeSwitch />
          </div> {/* navbar-start */}

          <div className="navbar-center border border-neutral rounded-box p-2 bg-base-100">
            <div className="flex-auto justify-end ">

              <ConnectButton
                accountStatus={{ smallScreen: 'address', largeScreen: 'address', }}
                showBalance={true}
              />

            </div> 
          </div> {/* navbar-center */}

          <div className="navbar-end">
            <Status/>
            <Avatar/>
          </div>


        </div> {/* Navbar */}
      </>
  );

};