// React

// Components
import LanguageSelector from "@Components/LanguageSelector";
import ThemeSwitch from "@Components/ThemeSwitch";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Avatar } from "@Components/NavbarAvatar";
import { NavbarStatus } from "@Components/NavbarStatus";

export default function Navbar(): JSX.Element {
  return (
    <div className="navbar bg-base-200 text-neutral rounded-box sticky top-0 opacity-90 shadow-xl z-10">
      <div className="navbar-start">
        <LanguageSelector />
        <ThemeSwitch />
      </div>
      <div className="navbar-center rounded-box p-2 bg-base-300">
        <div className="flex-auto justify-end ">
          <ConnectButton
            accountStatus={{ smallScreen: "address", largeScreen: "address" }}
            showBalance={true}
          />
        </div>
      </div>
      <div className="navbar-end">
        <NavbarStatus />
        <Avatar />
      </div>
    </div>
  );
}