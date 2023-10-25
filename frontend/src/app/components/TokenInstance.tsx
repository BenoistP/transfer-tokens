// React
import { useEffect, useCallback, useState } from "react";

// Components
import { TokenInstanceEditableAmount } from "@Components/TokenInstanceEditableAmount";

// Consts
import { ERC20_DECIMALS_DEFAULT } from "@uiconsts/misc";

// Translation
import { useTranslation } from "react-i18next";

// Icons
import { NoSymbolIcon, MinusSmallIcon } from '@heroicons/react/24/solid'

// ------------------------------

const TokenInstance = ( { tokenInstance, accountAddress, /* index, */ targetAddress, changeCheckboxStatus, enableEditable }: ITokenProps ) => {

  // console.debug(`TokenInstance.tsx render`)
  const { t } = useTranslation()

  const [decimals, setdecimals] = useState<bigint>(BigInt((tokenInstance.decimals||ERC20_DECIMALS_DEFAULT))) as [bigint, (balance:bigint) => void];

  // const [balance, setbalance] = useState<BigInt>(tokenInstance.userData[accountAddress as any]?.amount) as [BigInt, (balance:BigInt) => void];
  // const [balance, setbalance] = useState<BigInt>(tokenInstance.userData[accountAddress as any]?.balance) as [BigInt, (balance:BigInt) => void];
  const [balance, setbalance] = useState<TTokenAmount | null>(tokenInstance.userData[accountAddress as any]?.balance);
  
  const [balanceString, setbalanceString] = useState("") as [string, (balance:string) => void];
  const [isSelected, setIsSelected] = useState<boolean>(false)
  const [isCheckboxDisabled, setisCheckboxDisabled] = useState<boolean>(true)

  // const [amount, setamount] = useState<BigInt>(tokenInstance.userData[accountAddress as any]?.balance) // as [BigInt, (amount:BigInt) => void];
  const [amount, setamount] = useState<TTokenAmount | null>(tokenInstance.userData[accountAddress as any]?.balance)

  // const [loadStatus, setStatus] = useState("Ok")


  // trigger Balance computations for display
  useEffect(() => {
    // if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
    // {
    //   console.debug(`TokenInstance.tsx useEffect tokenInstance.userData[accountAddress as any]?.amount:${tokenInstance.userData[accountAddress as any]?.amount} decimals:${decimals} `)
    // }

    if (balance) {
      const balanceValue = balance.valueOf();// + 1n;
      // console.debug(`TokenInstance.tsx useEffect balanceValue:${balanceValue} decimals:${decimals} `)
      const intValue = ( balanceValue / (10n**decimals) );
      // console.debug(`TokenInstance.tsx useEffect balance:${balance} decimals:${decimals} intValue:${intValue} `)
      // console.dir(intValue)
      const decimalValue = (balanceValue - intValue * (10n**decimals));
      // console.debug(`TokenInstance.tsx useEffect balanceValue:${balanceValue} decimals:${decimals} decimalValue:${decimalValue} `)
      if (decimalValue > 0) {
        const decimalDisplay = decimalValue.toString().padStart( Number(decimals) , "0");
        setbalanceString(`${intValue}.${decimalDisplay}`)
        // console.debug(`TokenInstance.tsx useEffect balanceValue:${balanceValue} decimals:${decimals} decimalDisplay:${decimalDisplay} `)
      } else {
        setbalanceString(`${intValue}.0`)
      }
    } else if (balance == 0n) {
      setbalanceString("0.0")
    }
  }, [/* balance, */ decimals/* , status */, /* tokenInstance.userData[accountAddress as any]?.amount] */ balance]);
  

  // ---

  useEffect(() => {
    // if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
    // {
    //   console.debug(`TokenInstance.tsx useEffect amount tokenInstance.userData[accountAddress as any]?.amount:${tokenInstance.userData[accountAddress as any]?.amount} decimals:${decimals} `)
    // }
    if (accountAddress) {
      // setbalance(tokenInstance.userData[accountAddress as any]?.balance);
      const accountBalance = tokenInstance.userData[accountAddress as any]?.balance;
      if (accountBalance) {
        setbalance(accountBalance);
      } else {
        setbalance(0n);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenInstance.userData[accountAddress as any]?.balance, accountAddress]);

  // ---

  useEffect(() => {
    // if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
    // {
    //   console.debug(`TokenInstance.tsx useEffect decimals`)
    // }
    setdecimals(BigInt((tokenInstance.decimals||ERC20_DECIMALS_DEFAULT)));
  }, [tokenInstance.decimals]);

  // ---

  useEffect(() => {
    if (accountAddress && tokenInstance.userData[accountAddress as any]?.selected) {
      setIsSelected(true);
    } else {
      setIsSelected(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenInstance.userData[accountAddress as any]?.selected, accountAddress]);

  // ---

  useEffect(() => {
    // if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
    // {
      // console.debug(`TokenInstance.tsx useEffect accountAddress:${accountAddress} balance:${balance} tokenInstance.userData[accountAddress as any]?.canTransfer=${tokenInstance.userData[accountAddress as any]?.canTransfer}`)
    // }
    if (/* balance && */ /* accountAddress */targetAddress &&
        tokenInstance.userData[/* accountAddress */targetAddress as any]?.canTransfer
        && (balance?.valueOf() || 0n) > 0n
        && amount||0 > 0
        )
    {
      setisCheckboxDisabled(false);
      // console.debug(`TokenInstance.tsx useEffect SETISDISABLED FALSE balance:${balance} amount:${amount}`)
    } else {
      // console.debug(`TokenInstance.tsx useEffect SETISDISABLED TRUE balance:${balance} amount:${amount}`)
      setisCheckboxDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ targetAddress, tokenInstance.userData[/* accountAddress */targetAddress as any]?.canTransfer, balance /* , accountAddress */, amount]);

  // ---

  const unSelect = useCallback( (/* tokenInstance:TTokenInstance */) =>
    {
      const id = tokenInstance.chainId+"-"+tokenInstance.address
      console.debug(`TokenInstance.tsx: unSelect( id:${id} ) balance:${balance} tokenInstance.userData[targetAddress as any]=`)
      console.dir(tokenInstance.userData[targetAddress as any])
      
      // console.debug(`TokenInstance.tsx: handleCheckboxClick( id:${id} )`)
      if (balance && /* accountAddress */targetAddress && typeof /* accountAddress */targetAddress == "string" && tokenInstance.userData[/* accountAddress */targetAddress as any]?.canTransfer && tokenInstance.userData[/* accountAddress */accountAddress as any]?.selected && changeCheckboxStatus) {
        // console.debug(`TokenInstance.tsx: handleCheckboxClick( id:${tokenInstance.address} ) balance:${balance} tokenInstance.userData[accountAddress as any]=${tokenInstance.userData[accountAddress as any]}`)
        // console.debug(`TODO: changeCheckboxStatus(id)`)
        changeCheckboxStatus(id, {checked: false});
      } /* else {
        console.debug(`TokenInstance.tsx: handleCheckboxClick( id:${id} ) balance:${balance}`)
      } */
    },
    [
      // /* index, */ balance, accountAddress, changeCheckboxStatus, tokenInstance.userData[accountAddress as any]?.canTransfer
      accountAddress,
      targetAddress, balance, changeCheckboxStatus, tokenInstance.address, tokenInstance.chainId, tokenInstance.userData]
  );

  // ---

  useEffect(() =>
    {
        // console.debug(`TokenInstance.tsx useEffect amount:${amount}`)
        if (amount!=null && amount.valueOf() == 0n) 
        {
          // console.debug(`TokenInstance.tsx useEffect AMOUNT ZERO amount:${amount}`)
          if (tokenInstance.userData[/* accountAddress */targetAddress as any]?.selected) unSelect(/* tokenInstance */)
          setisCheckboxDisabled(true);
          if (tokenInstance.userData[/* accountAddress */targetAddress as any]) tokenInstance.userData[/* accountAddress */targetAddress as any].transferAmount = 0n;
          // tokenInstance.userData[accountAddress as any].transferAmount = amount.valueOf();
          // tokenInstance.selectable = false;
        } else if (/* accountAddress */targetAddress && tokenInstance.userData[/* accountAddress */targetAddress as any]?.canTransfer
            && (balance?.valueOf() || 0n) > 0n )
        {
          setisCheckboxDisabled(false)
          // console.debug(`TokenInstance.tsx useEffect SETISDISABLED FALSE amount:${amount}`)
          tokenInstance.userData[/* accountAddress */targetAddress as any].transferAmount = amount?.valueOf() || 0n;
          tokenInstance.selectable = true;
        }
    },
    [
      // tokenInstance.userData[accountAddress as any]?.transferAmount, amount]
      /* accountAddress */targetAddress, amount, balance, tokenInstance, unSelect,
    ]
  );

  // ---

  useEffect(() =>
    {
      // console.debug(`TokenInstance.tsx useEffect NO DEPS`)
      if (balance != null) {
        const balanceValue = balance.valueOf();// + 1n;
          // console.debug(`TokenInstance.tsx useEffect balanceValue:${balanceValue} decimals:${decimals} `)
          const intValue = ( balanceValue / (10n**decimals) );
          // console.debug(`TokenInstance.tsx useEffect balance:${balance} decimals:${decimals} intValue:${intValue} `)
          // console.dir(intValue)
          const decimalValue = (balanceValue - intValue * (10n**decimals));
          // console.debug(`TokenInstance.tsx useEffect balanceValue:${balanceValue} decimals:${decimals} decimalValue:${decimalValue} `)
          if (decimalValue > 0) {
            const decimalDisplay = decimalValue.toString().padStart( Number(decimals) , "0");
            setbalanceString(`${intValue}.${decimalDisplay}`)
            // console.debug(`TokenInstance.tsx useEffect balanceValue:${balanceValue} decimals:${decimals} decimalDisplay:${decimalDisplay} `)
          } else {
            setbalanceString(`${intValue}.0`)
          }
      } // if balance != null
    
      },
      // run only once
      [] // eslint-disable-line react-hooks/exhaustive-deps
    );

  // ---

  const handleCheckboxClick = useCallback( (/* tokenInstance:TTokenInstance */) =>
    {
      const id = tokenInstance.chainId+"-"+tokenInstance.address
      // console.debug(`TokenInstance.tsx: handleCheckboxClick( id:${id} )`)

      if (amount && amount.valueOf() > 0n) {
        // console.debug(`TokenInstance.tsx: handleCheckboxClick amount.valueOf():${amount.valueOf()}`)
        if (balance && /* accountAddress */targetAddress && typeof /* accountAddress */targetAddress == "string" && tokenInstance.userData[/* accountAddress */targetAddress as any]?.canTransfer && changeCheckboxStatus) {
        // console.debug(`TokenInstance.tsx: handleCheckboxClick( id:${tokenInstance.address} ) balance:${balance} tokenInstance.userData[accountAddress as any]=${tokenInstance.userData[accountAddress as any]}`)
        // console.debug(`TODO: changeCheckboxStatus(id)`)
          changeCheckboxStatus(id);
        }
        // else {
        //   console.debug(`TokenInstance.tsx: handleCheckboxClick( id:${id} ) balance:${balance}`)
        // }
      }
    },
    [
      // /* index, */ balance, amount, accountAddress, changeCheckboxStatus, tokenInstance.userData[accountAddress as any]?.canTransfer
      targetAddress,
      // accountAddress, 
      tokenInstance.chainId, tokenInstance.address, tokenInstance.userData, amount, balance, changeCheckboxStatus]
  );

  // ------------------------------

  const clsTextSize = "text-xs sm:text-sm md:text-base"
  const clsTextLight = "font-light " + clsTextSize
  const clsTextReadable = "font-normal " + clsTextSize
  const clsTextPaddingLeft = "pl-2 "
  const clsText = clsTextPaddingLeft + (balance && balance.valueOf() > 0n ? clsTextReadable : clsTextLight)
  const clsTooltipLeft = "tooltip tooltip-left " + clsTextReadable

  const canTransfer = (targetAddress && (tokenInstance.userData[targetAddress as any] )) ? tokenInstance.userData[/* accountAddress */ targetAddress as any]?.canTransfer : false

  // console.debug(`TokenInstance.tsx render cantTransfer=${cantTransfer} (targetAddress && (tokenInstance.userData[targetAddress as any] != undefined))=${(targetAddress && (tokenInstance.userData[targetAddress as any] != undefined))} tokenInstance.userData[targetAddress as any]=`)
  // console.debug(`TokenInstance.tsx render canTransfer=${canTransfer} ; if(targetAddress && (tokenInstance.userData[targetAddress as any] ))="${(targetAddress && (tokenInstance.userData[targetAddress as any] ))?true:false }" ; tokenInstance.userData[targetAddress as any]=`)
  // console.dir(tokenInstance.userData[targetAddress as any])

  // console.debug(`TokenInstance.tsx render canTransfer=${canTransfer} , targetAddress=${targetAddress}`)

  // ------------------------------

  return (
    <>
      <td className={clsTextPaddingLeft+"w-8 text-center font-thin"}>{tokenInstance.displayId}</td>
      {/* <td>{tokenInstance.address}</td> */}
      {/* <td className={clsText + " text-ellipsis min-w-full" + (balance?"":" opacity-60")}> */}
      <td className={clsText + " text-ellipsis min-w-full "}>
        {tokenInstance.name ?
            tokenInstance.name
          :
          <Loading/>
        }
      </td>
      {/* <td>{loadStatus}</td> */}
      <td className={clsText + " text-right pr-2"}>
        {balanceString ? balanceString : <Loading/>}
      </td>
      { enableEditable ?
        <td className="">
          { canTransfer && changeCheckboxStatus ?
              <input
                type="checkbox"
                className="checkbox checkbox-xs sm:checkbox-md md:checkbox-md mt-1 "
                checked={isSelected}
                onChange={(/* e */) => handleCheckboxClick(/* e, index,*/  /* tokenInstance */)}
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
            { canTransfer ?
              <TokenInstanceEditableAmount selectable={tokenInstance.selectable} balance={(balance && balance.valueOf()?balance.valueOf(): 0n)} amount={(amount && amount.valueOf()?amount.valueOf():0n)} setamount={setamount} decimals={Number(decimals)/* tokenInstance.decimals */} unSelect={unSelect} />
              :
              <div className="flex justify-center">
                <MinusSmallIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current" />
              </div>
            }
          </td>
        :
          null
      }
      <td className={"min-h-full items-center justify-center" /* + clsText */ }>
        <div className="md:flex">
        { targetAddress && !canTransfer // cantTransfer
          &&
          <div className={clsTooltipLeft + " tooltip-warning"} data-tip={t("moveTokens.stepTwo.token.noTransferTo")} >
            <NoSymbolIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current" />
          </div>
        }
        {
          (tokenInstance.symbol || tokenInstance.address) &&
          <div className={clsTooltipLeft + " tooltip-info text-base-content tracking-tight"} data-tip={tokenInstance.symbol + "\n" + tokenInstance.address} >
            <span className="badge badge-ghost badge-sm bg-neutral text-neutral-content border border-neutral-content">
              {t("moveTokens.stepTwo.token.details")}
            </span>
          </div>
        }
        </div>
      </td>
    </>
  );
}


// ------------------------------

// const TokenError = (  ) => {
//   return (
//   <>
//     <td>❌ID</td>
//     <td>❌Token Address</td>
//     <td>❌Token Name</td>
//     <td>❌Status</td>
//     <td>❌Amount</td>
//     <td>❌Selected</td>
//     <td>❌Name</td>
//   </>
//   );
// }

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

export { TokenInstance,
  //  TokenError,
  };