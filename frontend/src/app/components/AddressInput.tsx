// React
import { useCallback, useEffect, useState} from "react";
// Utils
import { checkAndFixAddress0xFormat, isValidAddress, checksumAddress } from "@jsutils/blockchainUtils";
import { ADDRESS_MAX_SIZE, NULL_ADDRESS } from "@jsconsts/addresses";
// Translation
import { useTranslation } from 'react-i18next';
// Icons
import { BackspaceIcon, CheckIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'

// ------------------------------

const AddressInput = ({
  sourceAddress,
  targetAddress,
  settargetAddress } :IAddressInputProps ) =>
{

  const { t } = useTranslation();
  const [addressInput, setaddressInput] = useState<string>(targetAddress);
  const NULLNULL_ADDRESS = NULL_ADDRESS+NULL_ADDRESS
  // const { data: address } = useEnsAddress({ name: 'xxx.eth' }) // not supported on gnosis ?

  // ------------------------------

  // console.debug(`AddressInput.tsx render`)

  const handleAddress = /* useCallback( */ (e: React.FormEvent<HTMLInputElement>): void /* ) */ => {
    const addressInput = e.currentTarget.value
    let addressSliced;
    // Restrict input size
    if (addressInput.slice(0,4).toLowerCase() == NULLNULL_ADDRESS) {
      // remove 0x0x
      addressSliced = addressInput.slice(2, ADDRESS_MAX_SIZE+2)
    } else {
      addressSliced = addressInput.slice(0, ADDRESS_MAX_SIZE)
    }
    const addressFixed:TAddressString = checkAndFixAddress0xFormat(addressSliced)
    if (addressFixed.length == ADDRESS_MAX_SIZE) {
      const addressFixedChecksummed = checksumAddress(addressFixed)
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

  const eraseAddressInput = useCallback( () =>
    {
      setaddressInput("")
    },
    []
  ) // eraseAddressInput

  // ---

  const isInputAddressValid = useCallback( () =>
    {
      const isValidAddressInput = isValidAddress(addressInput)
      return isValidAddressInput
    },
    [addressInput]
  ) // isInputAddressValid

  useEffect( () =>
    {
      if (addressInput && isValidAddress(addressInput) && sourceAddress!=addressInput) {
          settargetAddress(addressInput as TAddressString)
        } else {
          settargetAddress("")
      }
    },
    [ addressInput, settargetAddress, sourceAddress ]
  ) // useEffect

  // ------------------------------

  // 0: info // 1: success // 2: warning // 3: error
  const inputStatus:number = (addressInput == "" ? 0 : ( isInputAddressValid() ? ( (sourceAddress && sourceAddress!=addressInput) ? 1 : 2 ) : 3) );
  const clsAddressTextContentHelper = ( inputStatus == 0 ? 'text-info-content': (inputStatus == 1 ? 'text-success-content' : (inputStatus == 2 ? 'text-warning-content' : 'text-error-content') ) ) ;
  const clsAddresBgHelper = ( inputStatus == 0 ? 'bg-info': (inputStatus == 1 ? 'bg-success' : (inputStatus == 2 ? 'bg-warning' : 'bg-error') ) ) ;
  const clsAddressIconHelper = 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-2'
  const clsInput = "input join-item tracking-tight ring ring-neutral border-1 input-neutral text-left w-80 input-xs sm:input-sm sm:w-96 md:input-md text-accent-content m-1 " + ( (addressInput == "" || addressInput == null) ? 'border-info' : (isInputAddressValid() ? ((sourceAddress && sourceAddress!=addressInput)? 'border-success' : 'border-warning' ) : 'border-error') )

  return (

      <div className={"w-full transition-all rounded-lg m-0 p-1 justify-start items-start " + clsAddresBgHelper}>

        <div className="flex flex-wrap">

            <div className="form-control flex">
              <div className=" join ">
                <input
                  type="text" placeholder={ t("moveTokens.stepOne.destinationPlaceholder")}
                  className={clsInput}
                  size={ADDRESS_MAX_SIZE} minLength={ADDRESS_MAX_SIZE} maxLength={ADDRESS_MAX_SIZE}
                  value={addressInput}
                  onChange={ (e) => {handleAddress(e)} }
                  spellCheck="false"
                />
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
              </label>

            </div>

          </div>

        </div>

      </div>
  );

};

// ------------------------------

export default AddressInput;