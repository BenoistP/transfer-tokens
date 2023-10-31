// React
import { useEffect, useState} from "react";

// Context
import { useGlobalAppContext } from "@Providers/GlobalAppProvider/GlobalAppContext";

import { useAccount } from 'wagmi'

// ------------------------------

export const Avatar = () => {

  const { address:connectedAddress, } = useAccount()
  const { globalAppData:{ address:globalAddress }, globalAppDataHandlers: { getAddress, setAddress, getAvatarComponent, } } = useGlobalAppContext()

  const [avatarComponent, setavatarComponent] = useState<any>(undefined)

  // ---

  useEffect(() => {
    if (connectedAddress!=getAddress()) {
      setAddress(connectedAddress);
    }
  }, [connectedAddress, getAddress, setAddress])

  useEffect(() => {
    setavatarComponent(getAvatarComponent());
  }, [getAvatarComponent, globalAddress])

  // ------------------------------

  return (
    <div className="">
        <label tabIndex={0} className="btn btn-circle avatar scale-90 hover:scale-100 ">
            <div className="w-10 rounded-full">
              {avatarComponent}
            </div>
        </label>

 {/*        <div className="dropdown bg-base-200">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                {avatarComponent}
              </div>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-2 z-[1] p-2 shadow-lg rounded w-36 bg-base-300 ">
              <li className="flex  ">
                <div className="bg-base-300 text-accent-content opacity-100">
                    1
                </div>
              </li>
              <li className="flex  ">
                <div className="bg-base-300 text-accent-content opacity-100">
                    2
                </div>
              </li>
          </ul>
        </div>
 */}
      </div>
  );

};