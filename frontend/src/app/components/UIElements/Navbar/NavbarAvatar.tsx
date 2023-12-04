// React
import { useEffect, useState } from "react";
// Context
import { useGlobalAppContext } from "@Providers/GlobalAppProvider/GlobalAppContext";
// Account
import { useAccount } from 'wagmi'

export default function Avatar() {

  const { address: connectedAddress, } = useAccount()
  const { globalAppData: { address: globalAddress }, globalAppDataHandlers: { getAddress, setAddress, getAvatarComponent, } } = useGlobalAppContext()
  const [avatarComponent, setavatarComponent] = useState<any>(undefined)

  useEffect(() => {
    if (connectedAddress != getAddress()) {
      setAddress(connectedAddress);
    }
  }, [connectedAddress, getAddress, setAddress])

  useEffect(() => {
    setavatarComponent(getAvatarComponent());
  }, [getAvatarComponent, globalAddress])


  return (
    <div className="">
      <label tabIndex={0} className="btn btn-circle avatar scale-90 hover:scale-100 ">
        <div className="w-10 rounded-full">
          {avatarComponent}
        </div>
      </label>
    </div>
  );
}