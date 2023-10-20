import { useCallback, useEffect, useState} from "react";
import { checkAndFixAddress0xFormat, isValidAddress, checksumAddress } from "@jsutils/blockchainUtils";
import { /* ADDRESS_MIN_SIZE, */ ADDRESS_MAX_SIZE, /* DEFAULT_TARGET_ADDRESS, */ NULL_ADDRESS } from "@jsutils/constants/addresses";
import { BackspaceIcon, CheckIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'

// Context
// import { useGlobalAppContext } from "@Providers/GlobalAppProvider/GlobalAppContext";

// Translation
import { useTranslation } from 'react-i18next';

// import { useAccount , useNetwork, useBlockNumber, useEnsAvatar,/* useBalance */ 
// useBalance,
// useEnsAddress} from 'wagmi'

// import { normalize } from 'viem/ens'

// import { fetchBalance } from '@wagmi/core'

const AddressInput = ({
  sourceAddress,
  targetAddress,
  settargetAddress
} :IAddressInputProps ) => {

  // const { data: address } = useEnsAddress({ name: 'xxx.eth' }) // not supported on gnosis ?
  const { t } = useTranslation();
  // const [addressInput, setaddressInput] = useState<TAddressString>(targetAddress);
  // const [addressInput, setaddressInput] = useState<TAddressEmpty>(targetAddress);
  const [addressInput, setaddressInput] = useState<string>(targetAddress);
  const NULLNULL_ADDRESS = NULL_ADDRESS+NULL_ADDRESS

  // ------------------------------

  // console.debug(`AddressInput.tsx render`)

  const handleAddress = /* useCallback( */ (e: React.FormEvent<HTMLInputElement>): void /* ) */ => {
    // console.debug(`AddressInput.tsx handleAddress useCallback`)
    // console.debug(`AddressInput.tsx handleAddress useCallback e.currentTarget.value: ${e.currentTarget.value}`)
    const addressInput = e.currentTarget.value
    // const addressSliced = e.currentTarget.value.slice(0, ADDRESS_MAX_SIZE)
    let addressSliced;

    // Restrict input size
    if (addressInput.slice(0,4).toLowerCase() == NULLNULL_ADDRESS) {
      // remove 0x0x
      addressSliced = addressInput.slice(2, ADDRESS_MAX_SIZE+2)
    } else {
      addressSliced = addressInput.slice(0, ADDRESS_MAX_SIZE)
    }
    // console.debug(`AddressInput.tsx handleAddress useCallback addressSliced: ${addressSliced}`)
/* 
    if (addressSliced.length < DEFAULT_TARGET_ADDRESS.length) {
      // console.debug(`AddressInput.tsx handleAddress useCallback addressSliced.length < DEFAULT_TARGET_ADDRESS.length`)
      // console.debug("set DEFAULT 0x")
      setaddressInput(DEFAULT_TARGET_ADDRESS)
      return 
    }
 */
    const addressFixed:TAddressString = checkAndFixAddress0xFormat(addressSliced)
    // console.debug(`AddressInput.tsx handleAddress useCallback addressFixed: ${addressFixed}`)
    if (addressFixed.length == ADDRESS_MAX_SIZE) {
      const addressFixedChecksummed = checksumAddress(addressFixed)
      // console.debug(`AddressInput.tsx handleAddress useCallback addressFixedChecksummed: ${addressFixedChecksummed}`)
      if (isValidAddress(addressFixedChecksummed)) {
        setaddressInput(addressFixedChecksummed)
      } else {
        setaddressInput(addressSliced)
      }
    } else {
      setaddressInput(addressSliced)
    }
  } // handleAddress

  // ---

  const eraseAddressInput = useCallback( () => {
    // console.debug(`AddressInput.tsx eraseAddressInput useCallback`)
    setaddressInput("")
  } // eraseAddressInput
  , [] ); // eslint-disable-next-line react-hooks/exhaustive-deps
  // ---

  const isInputAddressValid = useCallback( () => {
    // console.debug(`AddressInput.tsx isInputAddressValid useCallback`)
    const isValidAddressInput = isValidAddress(addressInput)
    // console.debug(`AddressInput.tsx isInputAddressValid useCallback isValidAddressInput: ${isValidAddressInput} addressInput: ${addressInput}`)
    return isValidAddressInput
  }, [addressInput] )
/*   , [] ); // eslint-disable-next-line react-hooks/exhaustive-deps */

  useEffect( () =>
    {
      // console.debug(`AddressInput.tsx useEffect`)
      if (addressInput && isValidAddress(addressInput) && sourceAddress!=addressInput) {
          settargetAddress(addressInput as TAddressString)
        } else {
          settargetAddress("")
      }
    },
    [
      // addressInput
      addressInput, settargetAddress, sourceAddress]
  )

  // ------------------------------
/*
const handleValidate = useCallback(
  () =>
    {
      console.debug(`handleValidate`);
      // settargetAddress(addressInput)
    },
    []
  ); 
*/

/*   const clsAddressHelper = (addressInput == "" ? 'text-accent-content': (isInputAddressValid() ? ((sourceAddress && sourceAddress!=addressInput)? 'text-success font-medium' : 'text-warning' ) : 'text-error') )
 */  // const clsValidate = "btn  rounded-btn btn-neutral btn-outline shadow-xl text py-2 px-1 sm:px-1 md:px-2 m-1 md:m-2" + //  disabled:opacity-50 : "hover:bg-gray-100")
  // " ease-in-out duration-300 sm:h-10 md:h-12" +
  // " disabled:btn disabled:btn-disabled disabled:cursor-no-drop"

  // 0: info // 1: success // 2: warning // 3: error
  const inputStatus:number = (addressInput == "" ? 0 : ( isInputAddressValid() ? ( (sourceAddress && sourceAddress!=addressInput) ? 1 : 2 ) : 3) );
  // console.info(`AddressInput.tsx inputStatus: ${inputStatus}`)
  const clsAddressTextContentHelper = ( inputStatus == 0 ? 'text-info-content': (inputStatus == 1 ? 'text-success-content' : (inputStatus == 2 ? 'text-warning-content' : 'text-error-content') ) ) ;
  const clsAddresBgHelper = ( inputStatus == 0 ? 'bg-info': (inputStatus == 1 ? 'bg-success' : (inputStatus == 2 ? 'bg-warning' : 'bg-error') ) ) ;
  const clsAddressIconHelper = 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-2' // + inputStatus 
  // const clsInput = "input input-bordered w-full max-w-xs input-xs sm:input-sm md:input-md " + ( (addressInput == DEFAULT_TARGET_ADDRESS || addressInput == null) ? 'input-info' : (isInputAddressValid() ? 'input-success' : 'input-error') ) 
  const clsInput = "input join-item tracking-tight ring ring-neutral border-1 input-neutral text-left w-80 input-xs sm:input-sm sm:w-96 md:input-md text-accent-content m-1 " + ( (addressInput == "" || addressInput == null) ? 'border-info' : (isInputAddressValid() ? ((sourceAddress && sourceAddress!=addressInput)? 'border-success' : 'border-warning' ) : 'border-error') )

  return (

      <div className={"w-full transition-all rounded-lg m-0 p-1 justify-start items-start " + clsAddresBgHelper}> {/* bg-base-100 */}

        <div className="flex flex-wrap">

            <div className="form-control flex">
              <div className=" join ">
                <input
                  type="text" placeholder={ t("moveTokens.stepOne.destinationPlaceholder")}
                  className={clsInput}
                  /* minWidth={ADDRESS_MAX_SIZE} maxWidth={ADDRESS_MAX_SIZE} */
                  // min={ADDRESS_MIN_SIZE} max={ADDRESS_MAX_SIZE}
                  size={ADDRESS_MAX_SIZE} minLength={ADDRESS_MAX_SIZE} maxLength={ADDRESS_MAX_SIZE}
                  value={addressInput}
                  onChange={ (e) => {handleAddress(e)} }
                  spellCheck="false"
                />
                {/* <label className="label">
                  <span className="label-text-alt">Bottom Left label</span>
                  <span className="label-text-alt">Bottom Right label</span>
                </label> */}
                <button
                  className="btn btn-xs join-item min-h-full ring ring-inset ring-neutral"
                  onClick={ () => eraseAddressInput()}
                >
                  <BackspaceIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6  " />
                </button>
              </div>
              
            </div>

          <div className="flex rounded-lg items-center">

            <div className="   ">
              <label className={"label h-full m-0 p-2 label-text text-xs sm:text-sm lg:text-base " + clsAddressTextContentHelper }>
            
                  { (addressInput == "" || addressInput == null) &&
                    <>
                      <InformationCircleIcon className={clsAddressIconHelper} /> &nbsp;{t("moveTokens.stepOne.detinationEmpty")}
                    </>
                  }
                  { (isInputAddressValid() && (sourceAddress && sourceAddress!=addressInput)) &&
                    <>
                      <CheckIcon className={clsAddressIconHelper} />
                      &nbsp;{t("moveTokens.stepOne.destinationOk")}
                    </>
                  }
                  { (isInputAddressValid() && (sourceAddress && sourceAddress==addressInput)) &&
                    <>
                      <ExclamationTriangleIcon className={clsAddressIconHelper} />
                      &nbsp;{t("moveTokens.stepOne.destinationErrorSame")}
                    </>
                  }
                  { (!(addressInput == "" || addressInput == null) && !isInputAddressValid()) &&
                    <>
                      <XMarkIcon className={clsAddressIconHelper} />
                      &nbsp;{t("moveTokens.stepOne.destinationError")}
                    </>
                  }
            
                {/* <span className="label-text-alt">Top Right label</span> */}
              </label>

            </div>

          </div>

        </div>

      </div>
  );

};

// ------------------------------

export default AddressInput;