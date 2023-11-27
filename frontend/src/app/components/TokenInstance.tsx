// React
import { useEffect, useCallback, useState } from "react";
// Components
import { TokenInstanceEditableAmount } from "@Components/TokenInstanceEditableAmount";
// Consts & Enums
import { ERC20_DECIMALS_DEFAULT, SHORT_DISPLAY_DECIMAL_COUNT } from "@uiconsts/misc";
import { ETokenTransferState } from "@jsconsts/enums"; 
// Translation
import { useTranslation } from "react-i18next";
// Icons
import { NoSymbolIcon, MinusSmallIcon, CheckCircleIcon, ExclamationCircleIcon, StopCircleIcon,
  ArrowLeftOnRectangleIcon as ArrowReceive, ArrowRightOnRectangleIcon as ArrowSend,
  Cog8ToothIcon as CogToothProcessing } from '@heroicons/react/24/solid';

// ------------------------------

export default function TokenInstance (
  { tokenInstance, accountAddress, targetAddress,
    updateCheckboxStatus, updateTransferAmount, updateTransferAmountLock,
    enableEditable, showTransferAmountReadOnly }: ITokenProps ) {

  const { t } = useTranslation()

  const accountADDRESS = (accountAddress ? accountAddress.toUpperCase() : "")
  const targetADDRESS = targetAddress.toUpperCase()

  const [name, setname] = useState<string>("")
  const [symbol, setsymbol] = useState<string>("")

  const [balance, setbalance] = useState<TTokenAmount | null>(tokenInstance.userData[accountADDRESS as any]?.balance);
  const [decimals, setdecimals] = useState<bigint>(BigInt((tokenInstance.decimals||ERC20_DECIMALS_DEFAULT))) as [bigint, (balance:bigint) => void];

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

  const [canTransferFrom, setcanTransferFrom] = useState<boolean>( (accountADDRESS && (tokenInstance.userData[accountADDRESS as any] )) ? tokenInstance.userData[accountADDRESS as any]?.canTransfer : false )
  const [canTransferTo, setcanTransferTo] = useState<boolean>( (targetADDRESS && (tokenInstance.userData[targetADDRESS as any] )) ? tokenInstance.userData[targetADDRESS as any]?.canTransfer : false )

  /**
   * Name update
  */
  useEffect( () => { if (tokenInstance.name) setname(tokenInstance.name) }, [tokenInstance.name] );

  /**
   * Symbol update
   */
  useEffect( () => { if (tokenInstance.symbol) setsymbol(tokenInstance.symbol) }, [tokenInstance.symbol] );

  /**
   * Decimals update
   */
  useEffect( () => { setdecimals(BigInt((tokenInstance.decimals||ERC20_DECIMALS_DEFAULT))); }, [tokenInstance.decimals] );

  /**
   * Balance
   */
  useEffect( () =>
    {
      if (accountADDRESS) {
        const accountBalance = tokenInstance.userData[accountADDRESS as any]?.balance;
        setbalance(accountBalance?accountBalance:0n);
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokenInstance.userData[accountADDRESS as any]?.balance, accountADDRESS]
  );

  /**
   * trigger Balance computations for display on : decimals, balance
   */
  useEffect( () =>
    {
      try {
        if (targetADDRESS) {
          const targetBalance = tokenInstance.userData[targetADDRESS as any]?.balance;
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
      } catch (error) {
        console.error(`TokenInstance.tsx useEffect [decimals, balance] error=${error}`)
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokenInstance.userData[targetADDRESS as any]?.balance, targetADDRESS, decimals]
  );

  /**
   * TransferAmount update
  */
  useEffect( () =>
    {
      if (transferAmount != null && tokenInstance.transferAmount != transferAmount && updateTransferAmount) {
        updateTransferAmount(tokenInstance.selectID, transferAmount);
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [transferAmount, tokenInstance.transferAmount, updateTransferAmount, tokenInstance.selectID]
  );

  /**
   * TransferAmountLock update
   */

  useEffect(() =>
    {
      if (tokenInstance.transferAmountLock != transferAmountLock && updateTransferAmountLock) {
        updateTransferAmountLock(tokenInstance.selectID, transferAmountLock);
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [transferAmountLock, tokenInstance.transferAmountLock, tokenInstance.selectID, updateTransferAmountLock]
  );

  /**
   * canTransferFrom, canTransferTo
  */
  useEffect( () =>
    {
      setcanTransferFrom(accountADDRESS ? (tokenInstance.userData[accountADDRESS as any]?.canTransfer) : false )
      setcanTransferTo(targetADDRESS ? (tokenInstance.userData[targetADDRESS as any]?.canTransfer) : false )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountADDRESS, targetADDRESS, tokenInstance.userData[accountADDRESS as any]?.canTransfer, tokenInstance.userData[targetADDRESS as any]?.canTransfer]
  );

  /**
   * trigger Balance computations for display on : decimals, balance
   */
  useEffect( () =>
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

  /**
   * isSelected
  */
  useEffect( () =>
    {
      if (accountADDRESS && tokenInstance.selected) {
        setIsSelected(true);
      } else {
        setIsSelected(false);
      }
    },
    [ tokenInstance.selected, accountADDRESS ]
  );

  /**
   * isCheckboxDisabled
  */
  useEffect(() =>
    {
      if (
        !accountADDRESS || !targetADDRESS ||
        !tokenInstance.selectable ||
        !tokenInstance.userData ||
        !tokenInstance.userData[accountADDRESS as any]?.canTransfer ||
        !tokenInstance.userData[targetADDRESS as any]?.canTransfer ||
        (balance?.valueOf() || 0n) == 0n ||
        (transferAmount||0n) == 0n
      ) setisCheckboxDisabled(true)
      else setisCheckboxDisabled(false)
    },
    [ accountADDRESS, targetADDRESS, tokenInstance.selectable,
      tokenInstance.userData,
      balance, transferAmount]
  );

  /**
   * Update checkbox status on transfer ability change
  */
  const unSelect = useCallback( () =>
    {
      if (balance && targetADDRESS && tokenInstance.selected && tokenInstance.userData[targetADDRESS as any]?.canTransfer && updateCheckboxStatus) {
        updateCheckboxStatus(tokenInstance.selectID, {checked: false});
      }
    },
    [targetADDRESS, balance, updateCheckboxStatus, tokenInstance.userData, tokenInstance.selectID, tokenInstance.selected]
  );

  /**
   * Update checkbox status on transfer amount change
  */
  const handleCheckboxClick = useCallback( () =>
    {
      if (transferAmount && transferAmount.valueOf() > 0n) {
        if (balance && targetADDRESS && tokenInstance.userData && tokenInstance.userData[targetADDRESS as any]?.canTransfer && updateCheckboxStatus) {
          updateCheckboxStatus(tokenInstance.selectID);
        }
      }
    },
    [targetADDRESS, tokenInstance.selectID, tokenInstance.userData, transferAmount, balance, updateCheckboxStatus]
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
        { name ? name : (symbol ? symbol : <Loading/>) }
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
        { !targetADDRESS ?
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
        {(tokenInstance.transferState.transfer == ETokenTransferState.processed || tokenInstance.transferState.transfer == ETokenTransferState.previous_processed) &&
          <div className={clsTooltipLeft + "pl-1 text-info tooltip-success"} data-tip={t("moveTokens.stepAny.token.transfer.success")} >
            <CheckCircleIcon className={clsIconSize+" fill-success" + (tokenInstance.transferState.transfer>10?" opacity-50":"") } />
          </div>
        }
        {tokenInstance.transferState.transfer == ETokenTransferState.skipped &&
          <div className={clsTooltipLeft + "pl-1  "} data-tip={t("moveTokens.stepAny.token.transfer.skipped")} >
            <StopCircleIcon className={clsIconSize+(tokenInstance.transferState.transfer>10?" opacity-50":"")} />
          </div>
        }
        {tokenInstance.transferState.transfer == ETokenTransferState.error &&
          <div className={clsTooltipLeft + "pl-1 text-info tooltip-error"} data-tip={t("moveTokens.stepAny.token.transfer.error")} >
            <ExclamationCircleIcon className={clsIconSize + " fill-error" + (tokenInstance.transferState.transfer>10?" opacity-50":"") } />
          </div>
        }
        {tokenInstance.transferState.transfer == ETokenTransferState.processing &&
          <div className={clsTooltipLeft + "pl-1 text-info tooltip-info"} data-tip={t("moveTokens.stepAny.token.transfer.processing")} >
            <CogToothProcessing className={clsIconSize +" animate-spin fill-info" + (tokenInstance.transferState.transfer>10?" opacity-50":"") } />
          </div>
        }
        </div>
      </td>
      { targetADDRESS &&
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

const Loading = () => {
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