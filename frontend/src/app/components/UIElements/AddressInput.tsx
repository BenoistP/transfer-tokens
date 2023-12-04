// React
import { useCallback, useEffect, useState } from "react";
// Utils
import { checkAndFixAddress0xFormat, isValidAddress, checksumAddress, isSmartContractAddress } from "@jsutils/blockchainUtils";
import { ADDRESS_MAX_SIZE, DEAD_ADDRESS, NULL_ADDRESS } from "@jsconsts/addresses";
// Translation
import { useTranslation } from 'react-i18next';
// Icons
import { BackspaceIcon, CheckIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'
// Check if address input is a contract
import { usePublicClient } from 'wagmi'

export default function AddressInput({
  sourceAddress,
  targetAddress,
  settargetAddress,
  chainId
}: IAddressInputProps): JSX.Element {

  const { t } = useTranslation();

  const [addressInput, setaddressInput] = useState<string>(targetAddress);
  const [isAddressInputSmartContract, setisAddressInputSmartContract] = useState<boolean>(false);
  const [isAddressInputValid, setisAddressInputValid] = useState(false)
  const [isAddressForbidden, setisAddressForbidden] = useState(false)
  const [isAddressEmpty, setisAddressEmpty] = useState(false)
  const [isAddressSame, setisAddressSame] = useState(false)

  // Wagmi public client
  const publicClient = usePublicClient({ chainId: chainId })

  const handleAddress = (e: React.FormEvent<HTMLInputElement>): void => {
    const addressInput = e.currentTarget.value
    if (!addressInput) {
      setaddressInput("")
    } else {
      const addressFixed: TAddressString = checkAndFixAddress0xFormat(addressInput)
      if (addressFixed.length == ADDRESS_MAX_SIZE) {
        const addressFixedChecksummed = checksumAddress(addressFixed)
        if (isValidAddress(addressFixedChecksummed)) {
          setaddressInput(addressFixedChecksummed)
        } else {
          setaddressInput(addressFixed)
        }
      } else {
        setaddressInput(addressFixed)
      }
    }
  }

  /**
   * Erase address input
   */
  const eraseAddressInput = useCallback(() => {
    setaddressInput("")
  },
    []
  )

  const isForbiddenAddress = useCallback((address: string) => {
    return (
      address == sourceAddress ||
      address == NULL_ADDRESS ||
      address == DEAD_ADDRESS
    )
  }, [sourceAddress]
  )
  /**
   * Validate the address input
   */
  useEffect(() => {
    const checkAddressInput = async (addressInput: string) => {
      const isValidAddressInput = isValidAddress(addressInput)
      setisAddressForbidden(isForbiddenAddress(addressInput))
      setisAddressInputValid(isValidAddressInput)
      setisAddressEmpty((addressInput == "" || addressInput == null))
      setisAddressSame((addressInput == sourceAddress))
      if (isValidAddressInput) {
        setisAddressInputSmartContract(await isSmartContractAddress(addressInput as TAddressString, publicClient))
      }
    }
    checkAddressInput(addressInput)
  },
    [addressInput, publicClient, sourceAddress, isForbiddenAddress]
  )

  /**
   * Validate the address input
   */
  useEffect(() => {
    if (isAddressInputValid && !isAddressForbidden) {
      settargetAddress(addressInput as TAddressString)
    } else {
      settargetAddress("")
    }
  },
    [addressInput, isAddressInputValid, isAddressForbidden, settargetAddress]
  ) // useEffect

  // Styles
  // 0: info // 1: success // 2: warning // 3: error
  const inputStatus: number = (isAddressEmpty ? 0 : (isAddressInputValid ? ((isAddressForbidden) ? 3 : (isAddressInputSmartContract ? 2 : 1)) : 3));

  const clsAddressTextContentHelper = (inputStatus == 0 ? 'text-info-content' : (inputStatus == 1 ? 'text-success-content' : (inputStatus == 2 ? 'text-warning-content' : 'text-error-content')));
  const clsAddresBgHelper = (inputStatus == 0 ? 'bg-info' : (inputStatus == 1 ? 'bg-success' : (inputStatus == 2 ? 'bg-warning' : 'bg-error')));
  const clsAddressIconHelper = 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-2'
  const clsInput = "input join-item tracking-tight ring ring-neutral border-1 input-neutral text-left w-80 input-xs sm:input-sm sm:w-96 md:input-md text-accent-content m-1 " +
    (isAddressEmpty ? 'border-info' : (isAddressInputValid ? ((isAddressForbidden) ? 'border-error' : (isAddressInputSmartContract ? 'border-warning' : 'border-success')) : 'border-error'))

  return (
    <div className={"w-full transition-all rounded-lg m-0 p-1 justify-start items-start " + clsAddresBgHelper}>

      <div className="flex flex-wrap">

        <div className="form-control flex">
          <div className=" join ">
            <input
              type="text" placeholder={t("moveTokens.stepOne.destinationPlaceholder")}
              className={clsInput}
              size={ADDRESS_MAX_SIZE} minLength={ADDRESS_MAX_SIZE} maxLength={ADDRESS_MAX_SIZE + 4}
              value={addressInput}
              onChange={(e) => { handleAddress(e) }}
              spellCheck="false"
            />
            <button
              className="btn btn-xs join-item min-h-full ring ring-inset ring-neutral"
              onClick={() => eraseAddressInput()}
            >
              <BackspaceIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6  " />
            </button>
          </div>
        </div>

        <div className="flex rounded-lg items-center">

          <div className="   ">
            <label className={"label h-full m-0 p-2 label-text text-xs sm:text-sm lg:text-base " + clsAddressTextContentHelper}>
              {(isAddressInputValid) ?

                isAddressSame ?
                  <>
                    <ExclamationTriangleIcon className={clsAddressIconHelper} />
                    &nbsp;{t("moveTokens.stepOne.destinationErrorSame")}
                  </>
                  :
                  isAddressForbidden ?
                    <>
                      <ExclamationTriangleIcon className={clsAddressIconHelper} />
                      &nbsp;{t("moveTokens.stepOne.destinationNotAllowed")}
                    </>
                    :
                    isAddressInputSmartContract ?
                      <>
                        <ExclamationTriangleIcon className={clsAddressIconHelper} />
                        &nbsp;{t("moveTokens.stepOne.destinationWarningSmartContract")}
                        <CheckIcon className={clsAddressIconHelper} />
                        &nbsp;{t("moveTokens.stepOne.destinationOk")}
                      </>
                      :
                      <>
                        <CheckIcon className={clsAddressIconHelper} />
                        &nbsp;{t("moveTokens.stepOne.destinationOk")}
                      </>
                :
                isAddressEmpty ?
                  <>
                    <InformationCircleIcon className={clsAddressIconHelper} /> &nbsp;{t("moveTokens.stepOne.destinationEmpty")}
                  </>
                  :
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
}