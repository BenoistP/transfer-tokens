// React
import { useEffect, useCallback, useState } from "react";
// Components
import { TokenInstanceEditableAmount } from "@Components/TokenInstanceEditableAmount";
// Consts
import { ERC20_DECIMALS_DEFAULT, SHORT_DISPLAY_DECIMAL_COUNT } from "@uiconsts/misc";
// Translation
import { useTranslation } from "react-i18next";
// Icons
import { NoSymbolIcon, MinusSmallIcon, CheckCircleIcon, ExclamationCircleIcon, StopCircleIcon,
  ArrowLeftOnRectangleIcon as ArrowReceive, ArrowRightOnRectangleIcon as ArrowSend, } from '@heroicons/react/24/solid'

// ------------------------------

const TokenInstance = ( {
  tokenInstance, accountAddress, targetAddress,
  updateCheckboxStatus, updateTransferAmount, updateTransferAmountLock,
  enableEditable, showTransferAmountReadOnly }: ITokenProps ) => {

  // console.debug(`TokenInstance.tsx render`)

  // if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
  // {
  //   console.debug(`TokenInstance.tsx render tokenInstance=`)
  //   console.dir(tokenInstance)
  // }

  const { t } = useTranslation()

  const [decimals, setdecimals] = useState<bigint>(BigInt((tokenInstance.decimals||ERC20_DECIMALS_DEFAULT))) as [bigint, (balance:bigint) => void];
  const [name, setname] = useState<string>("")

  const [balance, setbalance] = useState<TTokenAmount | null>(tokenInstance.userData[accountAddress as any]?.balance);

  const [isRoundedDisplayAmount, setisRoundedDisplayAmount] = useState<boolean>(false)
  const [shortBalanceString, setshortBalanceString] = useState("") as [string, (balance:string) => void];
  const [longBalanceString, setlongBalanceString] = useState("") as [string, (balance:string) => void];

  const [isRoundedTargetDisplayAmount, setisRoundedTargetDisplayAmount] = useState<boolean>(false)
  const [shortTargetBalanceString, setshortTargetBalanceString] = useState("") as [string, (balance:string) => void];
  const [longTargetBalanceString, setlongTargetBalanceString] = useState("") as [string, (balance:string) => void];

  const [isSelected, setIsSelected] = useState<boolean>(false)
  const [isCheckboxDisabled, setisCheckboxDisabled] = useState<boolean>(true)

  const [transferAmount, settransferAmount] = useState<TTokenAmount | null>(tokenInstance.transferAmount)
  const [transferAmountLock, settransferAmountLock] = useState<boolean>(tokenInstance.transferAmountLock)

  const [canTransferFrom, setcanTransferFrom] = useState<boolean>( (accountAddress && (tokenInstance.userData[accountAddress as any] )) ? tokenInstance.userData[accountAddress as any]?.canTransfer : false )
  const [canTransferTo, setcanTransferTo] = useState<boolean>( (targetAddress && (tokenInstance.userData[targetAddress as any] )) ? tokenInstance.userData[targetAddress as any]?.canTransfer : false )

  // ---

  /**
   * Name update
  */
  useEffect( () =>
    {
      if (tokenInstance.name) setname(tokenInstance.name)
    },
    [tokenInstance.name]
  );

  // ---

  /**
   * Decimals update
   */
  useEffect(() =>
    {
      setdecimals(BigInt((tokenInstance.decimals||ERC20_DECIMALS_DEFAULT)));
    },
    [tokenInstance.decimals]
  );

  // ---

  /**
   * Balance
   */
  useEffect(() =>
    {
      if (accountAddress) {
        const accountBalance = tokenInstance.userData[accountAddress as any]?.balance;
        if (accountBalance) {
          setbalance(accountBalance);
        } else {
          setbalance(0n);
        }
      }
    }, // X eslint-disable-next-line react-hooks/exhaustive-deps
    [tokenInstance.userData[accountAddress as any]?.balance, accountAddress]
  );

  useEffect(() =>
  {
    try {
      if (targetAddress) {
        const targetBalance = tokenInstance.userData[targetAddress as any]?.balance;
        if (targetBalance) {
          const balanceValue = targetBalance.valueOf();
          const intValue = ( balanceValue / (10n**decimals) );
          const decimalValue = balanceValue - intValue * (10n**decimals);
          if (decimalValue > 0) {
            // exact decimals display
            const longDecimalDisplayPadded = decimalValue.toString().padStart( Number(decimals) , "0");
            const zeroDecimalToFixed = Number("0."+longDecimalDisplayPadded).toFixed(SHORT_DISPLAY_DECIMAL_COUNT)
            const shortDecimalDisplay = zeroDecimalToFixed.substring(2);
            const roundUpShortDisplay = (zeroDecimalToFixed.substring(0,2) =="1.")
            const longBalanceString = intValue+"."+longDecimalDisplayPadded;
            const shortBalanceString = `${(roundUpShortDisplay?intValue+1n:intValue)}.${shortDecimalDisplay}`
            setlongTargetBalanceString(longBalanceString)
            setshortTargetBalanceString(shortBalanceString)
            if (roundUpShortDisplay || !longBalanceString.startsWith(shortBalanceString) || !longBalanceString.substring(shortBalanceString.length).match(/^0+$/)) {
              // console.debug(`TokenInstance.tsx useEffect [compute target balance] isRoundedTargetDisplayAmount=true`)
              setisRoundedTargetDisplayAmount(true)
            }
          } else {
            setlongTargetBalanceString(intValue.toString()+"."+"0".repeat(Number(decimals)))
            setshortTargetBalanceString(intValue.toString())
          }
        } else if (targetBalance == 0n) {
          setlongTargetBalanceString("0."+"0".repeat(Number(decimals)))
          setshortTargetBalanceString("0")
        }
      }
      // console.debug(`TokenInstance.tsx useEffect [compute target balance] ${tokenInstance.userData[targetAddress as any]?.balance}`)
      // setisRoundedTargetDisplayAmount(false)
    } catch (error) {
      console.error(`TokenInstance.tsx useEffect [decimals, balance] error=${error}`)
    }
  }, // X eslint-disable-next-line react-hooks/exhaustive-deps
  [tokenInstance.userData[targetAddress as any]?.balance, targetAddress]
);
  // ---

  useEffect(() =>
    {
      if (transferAmount != null && tokenInstance.transferAmount != transferAmount && updateTransferAmount) {
        updateTransferAmount(tokenInstance.selectID, transferAmount);
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [transferAmount, tokenInstance.transferAmount, updateTransferAmount, tokenInstance.selectID]
  );

  // ---

  useEffect(() =>
    {
      if (tokenInstance.transferAmountLock != transferAmountLock && updateTransferAmountLock) {
        updateTransferAmountLock(tokenInstance.selectID, transferAmountLock);
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [transferAmountLock, tokenInstance.transferAmountLock, tokenInstance.selectID, updateTransferAmountLock]
  );

  // ---

  /**
   * canTransferFrom, canTransferTo
  */
  useEffect( () =>
    {
      setcanTransferFrom(accountAddress ? (tokenInstance.userData[accountAddress as any]?.canTransfer) : false )
      setcanTransferTo(targetAddress ? (tokenInstance.userData[targetAddress as any]?.canTransfer) : false )
    },
    // X eslint-disable-next-line react-hooks/exhaustive-deps
    [accountAddress, targetAddress, tokenInstance.userData[accountAddress as any]?.canTransfer, tokenInstance.userData[targetAddress as any]?.canTransfer]
  );

  // ---

  /**
   * trigger Balance computations for display on : decimals, balance
   */
  useEffect(() =>
    {
      try {
        if (balance) {
          const balanceValue = balance.valueOf();
          const intValue = ( balanceValue / (10n**decimals) );
          const decimalValue = balanceValue - intValue * (10n**decimals);
          if (decimalValue > 0) {
            // exact decimals display
            const longDecimalDisplayPadded = decimalValue.toString().padStart( Number(decimals) , "0");
            const zeroDecimalToFixed = Number("0."+longDecimalDisplayPadded).toFixed(SHORT_DISPLAY_DECIMAL_COUNT)
            const shortDecimalDisplay = zeroDecimalToFixed.substring(2);
            const roundUpShortDisplay = (zeroDecimalToFixed.substring(0,2) =="1.")
            const longBalanceString = intValue+"."+longDecimalDisplayPadded;
            const shortBalanceString = `${(roundUpShortDisplay?intValue+1n:intValue)}.${shortDecimalDisplay}`
            setlongBalanceString(longBalanceString)
            setshortBalanceString(shortBalanceString)
            if (roundUpShortDisplay || !longBalanceString.startsWith(shortBalanceString) || !longBalanceString.substring(shortBalanceString.length).match(/^0+$/)) {
              setisRoundedDisplayAmount(true)
            }
          } else {
            setlongBalanceString(intValue.toString()+"."+"0".repeat(Number(decimals)))
            setshortBalanceString(intValue.toString())
          }
        } else if (balance == 0n) {
          setlongBalanceString("0."+"0".repeat(Number(decimals)))
          setshortBalanceString("0")
        }
      } catch (error) {
        console.error(`TokenInstance.tsx useEffect [decimals, balance] error=${error}`)
      }
    },
    [ decimals, balance, tokenInstance.displayId ]
  );

  // ---

  useEffect(  () =>
    {
      if (accountAddress && tokenInstance.selected) {
        setIsSelected(true);
      } else {
        setIsSelected(false);
      }
    },
    [ tokenInstance.selected, accountAddress ]
  );

  // ---

  useEffect(() =>
    {
      if (
        !accountAddress || !targetAddress ||
        !tokenInstance.selectable ||
        !tokenInstance.userData ||
        !tokenInstance.userData[accountAddress as any]?.canTransfer ||
        !tokenInstance.userData[targetAddress as any]?.canTransfer ||
        (balance?.valueOf() || 0n) == 0n ||
        (transferAmount||0n) == 0n
      ) {
        setisCheckboxDisabled(true)
        } else {
        setisCheckboxDisabled(false)
      }
    }, // X eslint-disable-next-line react-hooks/exhaustive-deps
    [ accountAddress, targetAddress, tokenInstance.selectable,
      tokenInstance.userData,
      balance, transferAmount]
  );


  // ---

  const unSelect = useCallback( () =>
    {
      if (balance && targetAddress && tokenInstance.selected && tokenInstance.userData[targetAddress as any]?.canTransfer && updateCheckboxStatus) {
        updateCheckboxStatus(tokenInstance.selectID, {checked: false});
      }
    },
    [targetAddress, balance, updateCheckboxStatus, tokenInstance.userData, tokenInstance.selectID, tokenInstance.selected]
  );

  // ---

  const handleCheckboxClick = useCallback( () =>
    {
      if (transferAmount && transferAmount.valueOf() > 0n) {
        if (balance && targetAddress && tokenInstance.userData && tokenInstance.userData[/* accountAddress */targetAddress as any]?.canTransfer && updateCheckboxStatus) {
          updateCheckboxStatus(tokenInstance.selectID);
        }
      }
    },
    [targetAddress, tokenInstance.selectID, tokenInstance.userData, transferAmount, balance, updateCheckboxStatus]
  );

  // ------------------------------

  const clsTextSize = "text-xs sm:text-sm md:text-base"
  const clsTextLight = "font-light " + clsTextSize
  const clsTextReadable = "font-normal " + clsTextSize
  const clsTextPaddingLeft = "pl-2 "
  const clsText = clsTextPaddingLeft + (balance && balance.valueOf() > 0n ? clsTextReadable : clsTextLight)
  const clsTooltipLeft = "tooltip tooltip-left " + clsTextReadable
  const clsIconSize = "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"

  // ------------------------------

  return (
    <>
      <td className={clsTextPaddingLeft+"w-8 text-center font-thin"}>{tokenInstance.displayId}</td>
      <td className={clsText + " text-ellipsis min-w-full "}>
        { name ? name : <Loading/> }
      </td>
      <td className={clsText + " text-right pr-2"}>
        { longBalanceString ?
            <div className="tooltip tooltip-info" data-tip={longBalanceString}>
              <p className={isRoundedDisplayAmount?"italic font-medium":""}>{shortBalanceString}</p>
            </div>
          :
            <Loading/>
          }
      </td>
      { enableEditable ?
        <td className="">
          { canTransferTo && canTransferFrom && updateCheckboxStatus ?
              <input
                type="checkbox"
                className="checkbox checkbox-xs sm:checkbox-md md:checkbox-md mt-1 "
                checked={isSelected}
                onChange={() => handleCheckboxClick()}
                disabled={isCheckboxDisabled}
              />
              :
              <input
                type="checkbox"
                className="checkbox checkbox-xs sm:checkbox-md md:checkbox-md mt-1 "
                checked={isSelected}
                disabled={true}
              />
          }
        </td>
        :
          null
      }
      { enableEditable ?
          <td className="p-1 ">
            { canTransferTo ?
              <TokenInstanceEditableAmount
                selectable={tokenInstance.selectable}
                readonly={false}
                balance={(balance && balance.valueOf()?balance.valueOf(): 0n)}
                amount={(transferAmount && transferAmount.valueOf()?transferAmount.valueOf():0n)}
                setamount={settransferAmount}
                transferAmountLock={transferAmountLock}
                settransferAmountLock={settransferAmountLock}
                decimals={Number(decimals)}
                unSelect={unSelect} />
              :
              <div className="flex justify-center text-neutral">
                <MinusSmallIcon className={clsIconSize+" fill-current"} />
              </div>
            }
          </td>
        :

        showTransferAmountReadOnly ?
          <td className="p-1 ">
              <TokenInstanceEditableAmount
                selectable={false}
                readonly={true}
                balance={(balance && balance.valueOf()?balance.valueOf(): 0n)}
                amount={(transferAmount && transferAmount.valueOf()?transferAmount.valueOf():0n)}
                setamount={settransferAmount}
                transferAmountLock={transferAmountLock}
                settransferAmountLock={settransferAmountLock}
                decimals={Number(decimals)}
                unSelect={unSelect} />
          </td>
          :
          null

      }
      <td className="min-h-full">
        <div className="flex ml-1 justify-start">
        {
          (tokenInstance.symbol || tokenInstance.address) &&
          <div className={clsTooltipLeft + "tooltip-info text-base-content tracking-tight"} data-tip={tokenInstance.symbol + "\n" + tokenInstance.address} >
            <span className="badge badge-ghost badge-sm bg-neutral text-neutral-content border border-neutral-content">
              {t("moveTokens.stepAny.token.details")}
            </span>
          </div>
        }
        { canTransferFrom ?
          <div className={clsTooltipLeft + "pl-1 text-info tooltip-info"} data-tip={t(canTransferFrom?"moveTokens.stepAny.token.canTransferFrom":"moveTokens.stepAny.token.noTransferFrom")} >
            <ArrowSend className={clsIconSize+" fill-current"} />
          </div>
          :
          <div className={clsTooltipLeft + "pl-1 text-warning tooltip-warning"} data-tip={t(canTransferFrom?"moveTokens.stepAny.token.canTransferFrom":"moveTokens.stepAny.token.noTransferFrom")} >
            <NoSymbolIcon className={clsIconSize+" fill-current"} />
          </div>
        }
        { targetAddress == "" ?
            null
          :
            (canTransferTo ?
              <div className={clsTooltipLeft + "pl-1 text-info tooltip-info"} data-tip={t("moveTokens.stepAny.token.canTransferTo")} >
                <ArrowReceive className={clsIconSize+" fill-current"} />
              </div>
              :
              <div className={clsTooltipLeft + "pl-1 text-warning tooltip-warning"} data-tip={t("moveTokens.stepAny.token.noTransferTo")} >
                <NoSymbolIcon className={clsIconSize+" fill-current"} />
              </div>
            )
        }
        {tokenInstance.tr_processed &&
          <div className={clsTooltipLeft + "pl-1 text-info tooltip-success"} data-tip={t("moveTokens.stepAny.token.transfer.success")} >
            <CheckCircleIcon className={clsIconSize+" fill-success"} />
          </div>
        }
        {tokenInstance.tr_skipped &&
          <div className={clsTooltipLeft + "pl-1  "} data-tip={t("moveTokens.stepAny.token.transfer.skipped")} >
            <StopCircleIcon className={clsIconSize+" "} />
          </div>
        }
        {tokenInstance.tr_error &&
          <div className={clsTooltipLeft + "pl-1 text-info tooltip-error"} data-tip={t("moveTokens.stepAny.token.transfer.error")} >
            <ExclamationCircleIcon className={clsIconSize+" fill-error"} />
          </div>
        }
        </div>
      </td>
      { targetAddress &&
      <td className="text-right pr-2 text-base-content">
        <div className="tooltip tooltip-left tooltip-info opacity-80" data-tip={longTargetBalanceString}>
          <p className={isRoundedTargetDisplayAmount?"italic font-medium":""}>{shortTargetBalanceString}</p>
        </div>
      </td>
      }
    </>
  );
}

// ------------------------------

const Loading = (  ) => {
  return (
  <>
    <span className="inline-flex items-center gap-px">
      <span className="animate-blink mx-px h-0.5 w-0.5 sm:h-1 sm:w-1 md:h-1.5 md:w-1.5 rounded-full bg-neutral"></span>
      <span className="animate-blink animation-delay-200 mx-px h-0.5 w-0.5 sm:h-1 sm:w-1 md:h-1.5 md:w-1.5 rounded-full bg-neutral"></span>
      <span className="animate-blink animation-delay-[400ms] mx-px h-0.5 w-0.5 sm:h-1 sm:w-1 md:h-1.5 md:w-1.5 rounded-full bg-neutral"></span>
    </span>
  </>
  );
}
// ------------------------------

export { TokenInstance };