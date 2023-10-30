// React
import { useEffect, useCallback, useState } from "react";

// Components
import { TokenInstanceEditableAmount } from "@Components/TokenInstanceEditableAmount";

// Consts
import { ERC20_DECIMALS_DEFAULT } from "@uiconsts/misc";

// Translation
import { useTranslation } from "react-i18next";

// Icons
import { NoSymbolIcon, MinusSmallIcon, ArrowLeftOnRectangleIcon as ArrowReceive, ArrowRightOnRectangleIcon as ArrowSend } from '@heroicons/react/24/solid'

// ------------------------------

const TokenInstance = ( { tokenInstance, accountAddress, targetAddress, changeCheckboxStatus, enableEditable }: ITokenProps ) => {

  // console.debug(`TokenInstance.tsx render`)

  // if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
  // {
  //   console.debug(`TokenInstance.tsx render tokenInstance=`)
  //   console.dir(tokenInstance)
  // }

  const { t } = useTranslation()

  const SHORT_DISPLAY_DECIMAL_COUNT = 3;

  const [decimals, setdecimals] = useState<bigint>(BigInt((tokenInstance.decimals||ERC20_DECIMALS_DEFAULT))) as [bigint, (balance:bigint) => void];
  const [name, setname] = useState<string>("")

  const [balance, setbalance] = useState<TTokenAmount | null>(tokenInstance.userData[accountAddress as any]?.balance);

  // const [balanceString, setbalanceString] = useState("") as [string, (balance:string) => void];
  const [shortBalanceString, setshortBalanceString] = useState("") as [string, (balance:string) => void];
  const [longBalanceString, setlongBalanceString] = useState("") as [string, (balance:string) => void];

  const [isSelected, setIsSelected] = useState<boolean>(false)
  const [isCheckboxDisabled, setisCheckboxDisabled] = useState<boolean>(true)

  // const [amount, setamount] = useState<BigInt>(tokenInstance.userData[accountAddress as any]?.balance) // as [BigInt, (amount:BigInt) => void];
  const [amount, setamount] = useState<TTokenAmount | null>(tokenInstance.userData[accountAddress as any]?.balance)
const [isRoundedDisplayAmount, setisRoundedDisplayAmount] = useState<boolean>(false)

  const [canTransferFrom, setcanTransferFrom] = useState<boolean>( (accountAddress && (tokenInstance.userData[accountAddress as any] )) ? tokenInstance.userData[accountAddress as any]?.canTransfer : false )
  const [canTransferTo, setcanTransferTo] = useState<boolean>( (targetAddress && (tokenInstance.userData[targetAddress as any] )) ? tokenInstance.userData[targetAddress as any]?.canTransfer : false )

//  // const canTransferFrom = (targetAddress && (tokenInstance.userData[accountAddress as any] )) ? tokenInstance.userData[accountAddress as any]?.canTransfer : false
//  // const canTransferTo = (targetAddress && (tokenInstance.userData[targetAddress as any] )) ? tokenInstance.userData[targetAddress as any]?.canTransfer : false


  // const tokenInstanceID = tokenInstance.chainId+"-"+tokenInstance.address
  // const [loadStatus, setStatus] = useState("Ok")
  // DEBUG
  if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197") {
    console.debug(`TokenInstance.tsx RENDER
    `);
  }

  // ---

  /**
   * Name update
  */
  useEffect( () =>
    {
      // if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
      // {
      //   console.debug(`TokenInstance.tsx useEffect [tokenInstance.name] tokenInstance.name=${tokenInstance.name}`)
      // }
     if (tokenInstance.name) setname(tokenInstance.name)
     if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
       {console.debug(`TokenInstance.tsx useEffect [tokenInstance.name]`)}
    },
    [tokenInstance.name]
  );

  // ---

  /**
   * Decimals update
   */
  useEffect(() =>
    {
      // if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
      // {
      //   console.debug(`TokenInstance.tsx useEffect decimals`)
      // }
      setdecimals(BigInt((tokenInstance.decimals||ERC20_DECIMALS_DEFAULT)));
      if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
        {console.debug(`TokenInstance.tsx useEffect [tokenInstance.decimals]`)}
    },
    [tokenInstance.decimals]
  );

  // ---

  /**
   * Balance
   */
  useEffect(() =>
    {
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
      if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
        {console.debug(`TokenInstance.tsx useEffect [tokenInstance.userData[accountAddress as any]?.balance]`)}
    }, // X eslint-disable-next-line react-hooks/exhaustive-deps
    [tokenInstance.userData[accountAddress as any]?.balance, accountAddress]
  );

  // ---

  /**
   * canTransferFrom, canTransferTo
   */
  useEffect( () =>
    {
      // console.debug(`TokenInstance.tsx useEffect targetAddress=${targetAddress} tokenInstance.userData[targetAddress as any]?.canTransfer=${tokenInstance.userData[targetAddress as any]?.canTransfer}`)
      setcanTransferFrom(accountAddress ? (tokenInstance.userData[accountAddress as any]?.canTransfer) : false )
      setcanTransferTo(targetAddress ? (tokenInstance.userData[targetAddress as any]?.canTransfer) : false )
      if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
        {console.debug(`TokenInstance.tsx useEffect [accountAddress, targetAddress, tokenInstance.userData[accountAddress as any]?.canTransfer, tokenInstance.userData[targetAddress as any]?.canTransfer]`)}
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
      // if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
      // {
      //   console.debug(`TokenInstance.tsx useEffect tokenInstance.userData[accountAddress as any]?.amount:${tokenInstance.userData[accountAddress as any]?.amount} decimals:${decimals} `)
      // }
      try {
        if (balance) {
          const balanceValue = balance.valueOf();// + 1n;
          // console.debug(`TokenInstance.tsx useEffect balanceValue:${balanceValue} decimals:${decimals} `)
          const intValue = ( balanceValue / (10n**decimals) );
          // console.debug(`TokenInstance.tsx useEffect balance:${balance} decimals:${decimals} intValue:${intValue} `)
          // console.dir(intValue)
          const decimalValue = (balanceValue - intValue * (10n**decimals));

          if (  tokenInstance.address.toUpperCase() == "0xD1095B31F41D3BDBb66A52B94a737b2D7Ac17635".toUpperCase() || // 14263-OHIO-ST-DETROIT
                tokenInstance.address.toUpperCase() == "0xf3c4c10ab96f9B6d7719De63f4219f69078Df976".toUpperCase() || // 14881-GREENFIELD-RD-DETROIT
                tokenInstance.address.toUpperCase() == "0x79e18a519D60c2ef7e18aac08D60Ba0D4Eee2511".toUpperCase() || // 20039-BLOOM-ST-DETROIT
                tokenInstance.address.toUpperCase() == "0x1E001730A23c7EBaFF35BC8bc90DA5a9b20804A4".toUpperCase() || // 9481 Wayburn St Detroit
                tokenInstance.address.toUpperCase() == "0xa137D82197Ea4cdfd5f008A91Ba816b8324F59E1".toUpperCase() || // 5601 S Wood St Chicago
                tokenInstance.address.toUpperCase() == "0x8D1090dF790FFAFdACCda03015c05dF3b4cC9c21".toUpperCase() // 15753-HARTWELL-ST-DETROIT
              ) {
            console.debug(`TokenInstance.tsx useEffect [balance, decimals] ${tokenInstance.address}  balanceValue=${balanceValue} intValue=${intValue} decimalValue=${decimalValue}`)
          }

          // console.debug(`TokenInstance.tsx useEffect balanceValue:${balanceValue} decimals:${decimals} decimalValue:${decimalValue} `)
          if (decimalValue > 0) {
            // exact decimals display
            const longDecimalDisplayPadded = decimalValue.toString().padStart( Number(decimals) , "0");
            //const zeroDecimal = Number(`0.${decimalValue.toString()}`)
            const zeroDecimalToFixed = Number(`0.${decimalValue.toString()}`).toFixed(SHORT_DISPLAY_DECIMAL_COUNT)
            const shortDecimalDisplay = zeroDecimalToFixed.substring(2);
            const roundUpShortDisplay = (zeroDecimalToFixed.substring(0,2) =="1.")
            // if (roundUpShortDisplay) {
            //   console.debug(`ROUNDING UP  intValue=${intValue}`)
            // }
            console.debug(`TokenInstance.tsx useEffect balanceValue=${balanceValue} intValue=${intValue} decimalValue=${decimalValue} zeroDecimalToFixed=${zeroDecimalToFixed} shortDecimalDisplay=${shortDecimalDisplay} longDecimalDisplayPadded=${longDecimalDisplayPadded}`)
            // setbalanceString(`${intValue}.${decimalDisplay}`)
            setlongBalanceString(`${intValue}.${longDecimalDisplayPadded}`)
            setshortBalanceString(`${(roundUpShortDisplay?intValue+1n:intValue)}.${shortDecimalDisplay}`)

            setisRoundedDisplayAmount(true)
            // console.debug(`TokenInstance.tsx useEffect balanceValue:${balanceValue} decimals:${decimals} decimalDisplay:${decimalDisplay} `)
          } else {
            // setbalanceString(`${intValue}.0`)
            // console.debug(`TokenInstance.tsx useEffect decimalValue<=0 tokenInstance.displayId=${tokenInstance.displayId} tokenInstance.=${tokenInstance.address} decimals:${decimals} intValue:${intValue} `)
            setlongBalanceString(`${intValue}.0`)
            setshortBalanceString(`${intValue}`)
          }
        } else if (balance == 0n) {
          // setbalanceString("0.0")
          setlongBalanceString("0.0")
          setshortBalanceString("0")
        }
        if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
          {console.debug(`TokenInstance.tsx useEffect [balance, decimals]`)}

      } catch (error) {
        console.error(`TokenInstance.tsx useEffect [decimals, balance] error=${error}`)
  }
    },
    [// balance,
      decimals,
      // status, tokenInstance.userData[accountAddress as any]?.amount]
      balance]
  );


  // ---

  useEffect(  () =>
    {
      // if (accountAddress && tokenInstance.userData[accountAddress as any]?.selected) {
      if (accountAddress && tokenInstance.selected) {
        setIsSelected(true);
      } else {
        setIsSelected(false);
      }
      // Xeslint-disable-next-line react-hooks/exhaustive-deps
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
        (amount||0n) == 0n
      ) {
        setisCheckboxDisabled(true)

        // if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
        // {console.debug(`TokenInstance.tsx useEffect [...] EN/DIS/ABLE CHECKBOX
        // accountAddress=${accountAddress} targetAddress=${targetAddress} tokenInstance.selectable=${tokenInstance.selectable} 
        // tokenInstance.userData[accountAddress as any]?.canTransfer=${tokenInstance.userData[accountAddress as any]?.canTransfer} 
        // tokenInstance.userData[targetAddress as any]?.canTransfer=${tokenInstance.userData[targetAddress as any]?.canTransfer} 
        // balance?.valueOf()=${balance?.valueOf()} amount=${amount} isCheckboxDisabled=${!accountAddress || !targetAddress ||
        //   !tokenInstance.selectable ||
        //   !tokenInstance.userData ||
        //   !tokenInstance.userData[accountAddress as any]?.canTransfer ||
        //   !tokenInstance.userData[targetAddress as any]?.canTransfer
        //   || (balance?.valueOf() || 0n) == 0n
        //    || (amount||0n) == 0n
        //   }
        // `)}
        } else {
        setisCheckboxDisabled(false)
      }

      if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
      {console.debug(`TokenInstance.tsx useEffect [...] EN/DIS/ABLE CHECKBOX`)}
    }, // X eslint-disable-next-line react-hooks/exhaustive-deps
    [ accountAddress, targetAddress, tokenInstance.selectable,
      tokenInstance.userData,
      // tokenInstance.userData[accountAddress as any]?.canTransfer,
      // tokenInstance.userData[targetAddress as any]?.canTransfer,
      balance, amount]
  );


/*
  useEffect( () =>
    {
      if (accountAddress && (tokenInstance.userData[accountAddress as any] )) {
        setcanTransferFrom(tokenInstance.userData[accountAddress as any]?.canTransfer)
      } else {
        setcanTransferFrom(false)
      }
    },
    [accountAddress, tokenInstance.userData]
  );

  useEffect( () =>
  {
    // console.debug(`TokenInstance.tsx useEffect targetAddress=${targetAddress} tokenInstance.userData[targetAddress as any]?.canTransfer=${tokenInstance.userData[targetAddress as any]?.canTransfer}`)
    if (targetAddress && (tokenInstance.userData[targetAddress as any] )) {
      setcanTransferTo(tokenInstance.userData[targetAddress as any]?.canTransfer)
    } else {
      setcanTransferTo(false)
    }
  },
  [targetAddress, tokenInstance.userData]
);


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
  }, [// balance,
    decimals,
    // status, tokenInstance.userData[accountAddress as any]?.amount]
    balance]);
  

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
    // Xeslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() =>
    {
      // if (accountAddress && tokenInstance.userData[accountAddress as any]?.selected) {
      if (accountAddress && tokenInstance.selected) {
        setIsSelected(true);
      } else {
        setIsSelected(false);
      }
      // Xeslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      tokenInstance.selected, accountAddress
    ]
  );

  // ---

  useEffect(() => {
    // if (tokenInstance.address == "0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197")
    // {
      // console.debug(`TokenInstance.tsx useEffect accountAddress:${accountAddress} balance:${balance} tokenInstance.userData[accountAddress as any]?.canTransfer=${tokenInstance.userData[accountAddress as any]?.canTransfer}`)
    // }
    if (
        // balance && accountAddress 
        targetAddress &&
        tokenInstance.userData[// accountAddress 
                            targetAddress as any]?.canTransfer
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
    // xeslint-disable-next-line react-hooks/exhaustive-deps
  }, [ targetAddress, tokenInstance.userData[targetAddress as any]?.canTransfer, balance, amount]);

  // ---

  useEffect(() =>
    {
        // console.debug(`TokenInstance.tsx useEffect amount:${amount}`)
        if (amount!=null && amount.valueOf() == 0n) 
        {
          // Clear amount and unselect
          // console.debug(`TokenInstance.tsx useEffect AMOUNT ZERO amount:${amount}`)
          // if (tokenInstance.userData[targetAddress as any]?.selected) unSelect()
          if (tokenInstance.selected) unSelect()
          setisCheckboxDisabled(true);
          if (tokenInstance.userData[targetAddress as any]) tokenInstance.transferAmount = 0n;
          // tokenInstance.userData[accountAddress as any].transferAmount = amount.valueOf();
          // tokenInstance.selectable = false;
        } else if (targetAddress && tokenInstance.userData[targetAddress as any]?.canTransfer
            && (balance?.valueOf() || 0n) > 0n )
        {
          setisCheckboxDisabled(false)
          // console.debug(`TokenInstance.tsx useEffect SETISDISABLED FALSE amount:${amount}`)
          // tokenInstance.userData[targetAddress as any].transferAmount = amount?.valueOf() || 0n;
          tokenInstance.transferAmount = amount?.valueOf() || 0n;
          tokenInstance.selectable = true;
        }
    },
    [
      targetAddress, amount, balance, tokenInstance, unSelect,
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

*/

  // ---

  const unSelect = useCallback( (// tokenInstance:TTokenInstance
    ) =>
    {
      // console.debug(`TokenInstance.tsx: unSelect( tokenInstance.selectID:${tokenInstance.selectID} ) balance:${balance} tokenInstance.userData[targetAddress as any]=`)
      // console.dir(tokenInstance.userData[targetAddress as any])
      if (balance && targetAddress && tokenInstance.selected && tokenInstance.userData[targetAddress as any]?.canTransfer && changeCheckboxStatus) {
        // console.debug(`TokenInstance.tsx: handleCheckboxClick( tokenInstanceID:${tokenInstance.address} ) balance:${balance} tokenInstance.userData[accountAddress as any]=${tokenInstance.userData[accountAddress as any]}`)
        // console.debug(`TODO: changeCheckboxStatus(tokenInstanceID)`)
        // changeCheckboxStatus(tokenInstanceID, {checked: false});
        changeCheckboxStatus(tokenInstance.selectID, {checked: false});
      }
      // else {
      //   console.debug(`TokenInstance.tsx: handleCheckboxClick( tokenInstanceID:${tokenInstanceID} ) balance:${balance}`)
      // }
    },
    [
      targetAddress, balance, changeCheckboxStatus, tokenInstance.userData,
      tokenInstance.selectID,
      tokenInstance.selected
    ]
  );

  // ---

  const handleCheckboxClick = useCallback( (/* tokenInstance:TTokenInstance */) =>
    {
      // console.debug(`TokenInstance.tsx: handleCheckboxClick( tokenInstanceID:${tokenInstanceID} )`)

      if (amount && amount.valueOf() > 0n) {
        // console.debug(`TokenInstance.tsx: handleCheckboxClick amount.valueOf():${amount.valueOf()}`)
        // if (balance && /* accountAddress */targetAddress && typeof /* accountAddress */targetAddress == "string" && tokenInstance.userData[/* accountAddress */targetAddress as any]?.canTransfer && changeCheckboxStatus) {
        if (balance && targetAddress && tokenInstance.userData && tokenInstance.userData[/* accountAddress */targetAddress as any]?.canTransfer && changeCheckboxStatus) {
        // console.debug(`TokenInstance.tsx: handleCheckboxClick( tokenInstanceID:${tokenInstance.address} ) balance:${balance} tokenInstance.userData[accountAddress as any]=${tokenInstance.userData[accountAddress as any]}`)
        // console.debug(`TODO: changeCheckboxStatus(tokenInstanceID)`)
          // changeCheckboxStatus(tokenInstanceID);
          changeCheckboxStatus(tokenInstance.selectID);
        }
        // else {
        //   console.debug(`TokenInstance.tsx: handleCheckboxClick( tokenInstanceID:${tokenInstanceID} ) balance:${balance}`)
        // }
      }
    },
    [
      // /* index, */ balance, amount, accountAddress, changeCheckboxStatus, tokenInstance.userData[accountAddress as any]?.canTransfer
      targetAddress,
      // accountAddress, tokenInstance.chainId, tokenInstance.address,
      // tokenInstanceID,
      tokenInstance.selectID,
      tokenInstance.userData, amount, balance, changeCheckboxStatus]
  );

  // ------------------------------

  const clsTextSize = "text-xs sm:text-sm md:text-base"
  const clsTextLight = "font-light " + clsTextSize
  const clsTextReadable = "font-normal " + clsTextSize
  const clsTextPaddingLeft = "pl-2 "
  const clsText = clsTextPaddingLeft + (balance && balance.valueOf() > 0n ? clsTextReadable : clsTextLight)
  const clsTooltipLeft = "tooltip tooltip-left " + clsTextReadable

  // const accountAddress = (targetAddress && (tokenInstance.userData[accountAddress as any] )) ? tokenInstance.userData[accountAddress as any]?.canTransfer : false
  // const canTransferTo = (targetAddress && (tokenInstance.userData[targetAddress as any] )) ? tokenInstance.userData[targetAddress as any]?.canTransfer : false

  // console.debug(`TokenInstance.tsx render canTransferTo=${canTransferTo}, targetAddress=${targetAddress} tokenInstance.userData[targetAddress as any]=${tokenInstance.userData[targetAddress as any]?.canTransfer}`)

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
          { canTransferTo && canTransferFrom && changeCheckboxStatus ?
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
            { canTransferTo ?
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
      <td className={"min-h-full" /* + clsText */ }>
        <div className="flex ml-1 justify-start">
        {
          (tokenInstance.symbol || tokenInstance.address) &&
          <div className={clsTooltipLeft + "tooltip-info text-base-content tracking-tight"} data-tip={tokenInstance.symbol + "\n" + tokenInstance.address} >
            <span className="badge badge-ghost badge-sm bg-neutral text-neutral-content border border-neutral-content">
              {t("moveTokens.stepTwo.token.details")}
            </span>
          </div>
        }
        
          { canTransferFrom ?
            <div className={clsTooltipLeft + "pl-1 tooltip-info"} data-tip={t(canTransferFrom?"moveTokens.stepTwo.token.canTransferFrom":"moveTokens.stepTwo.token.noTransferFrom")} >
              <ArrowSend className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current" />
            </div>
            :
            <div className={clsTooltipLeft + "pl-1 tooltip-warning"} data-tip={t(canTransferFrom?"moveTokens.stepTwo.token.canTransferFrom":"moveTokens.stepTwo.token.noTransferFrom")} >
              <NoSymbolIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current" />
            </div>
          }
        { targetAddress == "" ?
            null
          :
            (canTransferTo ?
              <div className={clsTooltipLeft + "pl-1 tooltip-info"} data-tip={t(canTransferTo?"moveTokens.stepTwo.token.canTransferTo":"moveTokens.stepTwo.token.noTransferTo")} >
                <ArrowReceive className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current" />
              </div>
              :
              <div>
                <NoSymbolIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current" />
              </div>
            )
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