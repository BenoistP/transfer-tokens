// React
import { useEffect, useCallback, useState } from "react";

// Icons
import { PlusCircleIcon, XCircleIcon, LockClosedIcon, LockOpenIcon
  // , ArrowSmallUpIcon, ArrowSmallDownIcon, MinusCircleIcon, NoSymbolIcon,
} from '@heroicons/react/24/solid'

// ------------------------------

const TokenInstanceEditableAmount = ( { selectable, balance,
  amount, setamount,
  transferAmountLock, settransferAmountLock, decimals, unSelect }: ITokenInstanceAmountProps ) => {

  // console.debug(`TokenInstanceEditableAmount.tsx (${index}) RealToken render realTokenInstance.userData.address=${realTokenInstance.userData.address} realTokenInstance.address=${realTokenInstance.address} realTokenInstance.userData.amount=${realTokenInstance.userData.amount}`)
 
// ---

//  const [decimals, setdecimals] = useState<bigint>(BigInt(tokenInstance.decimals)) as [bigint, (balance:bigint) => void];
  const [editableAmountString, seteditableAmountString] = useState("0") as [string, (balance:string) => void];
  // const [lock, setlock] = useState<boolean>(false)
  const [editable, seteditable] = useState<boolean>(selectable)
 // ---

  const Decimals = BigInt(decimals);
  const max = balance/*  * (10n**BigInt(decimals)) */;
  // const maxDisplay = balance / (10n**BigInt(decimals));

  const setMaxAmount = useCallback( () =>
    {
      // console.debug(`TokenInstanceEditableAmount.tsx setMaxAmount editableAmountString:${editableAmountString} `)
      seteditableAmountString(max.toString());
      setamount(max);
    },
    [max, setamount]
  );

  // ---

  const setZeroAmount = useCallback( () =>
    {
      // console.debug(`TokenInstanceEditableAmount.tsx setZeroAmount editableAmountString:${editableAmountString} `)
      seteditableAmountString("0.0");
      setamount(0n);
      if (unSelect) {unSelect()}
    },
    [editableAmountString, setamount, unSelect] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ---

  const setLockAmount = useCallback( () =>
    {
      // seteditableAmountString(max.toString());
      // setamount(max);
      settransferAmountLock(true);
    },
    [settransferAmountLock] // Xeslint-disable-line react-hooks/exhaustive-deps
  );

  // ---

  const setUnLockAmount = useCallback( () =>
    {
      // seteditableAmountString("0.0");
      // setamount(0n);
      settransferAmountLock(false);
    },
    [settransferAmountLock] // Xeslint-disable-line react-hooks/exhaustive-deps
  );

  // ---

  useEffect( () => {
      // console.debug(`TokenInstanceEditableAmount.tsx useEffect  selectable:${selectable}`)
      seteditable(selectable)
    },
    [selectable] // Xeslint-disable-line react-hooks/exhaustive-deps
  );

  // ---

  const updateAmount = /* useCallback( */
  (e: React.FormEvent<HTMLInputElement>): void =>
    {
      try {
        // console.debug(`updateAmount e.currentTarget.value: ${e.currentTarget.value} typeof= ${typeof e.currentTarget.value}`);
        const strValue = e.currentTarget.value;

        const strInt = strValue.split('.')[0]
        const strFloat = strValue.split('.')[1]

        const leadingZeros:number = strFloat?.match(/^0+/)?.[0].length || 0
        const floatValue = strFloat ? BigInt(strFloat) : 0n
        const intValue = BigInt(strInt)

        const amountValueInt =  BigInt(Math.pow(10, decimals)) * intValue ;
        const amountValueFloat = BigInt(Math.pow(10, decimals-(/* 1+ */leadingZeros+floatValue.toString().length))) * floatValue ;

        // const num = Number.parseFloat( strValue )
        // const floatP = num.toFixed(19)
        // console.debug(`updateAmount e.currentTarget.value: ${e.currentTarget.value} typeof e.currentTarget.value= ${typeof e.currentTarget.value} strInt=${strInt} strFloat=${strFloat} leadingZeros=${leadingZeros} floatValue=${floatValue} intValue=${intValue} amountValueInt=${amountValueInt} amountValueFloat=${amountValueFloat} floatValue.toString().length=${floatValue.toString().length}`);

        const value = amountValueInt + amountValueFloat

        if (value > max) {
          // console.debug(`updateAmount value: ${value} > max ${max} maxDisplay.toString()=${maxDisplay.toString()}}`);
          setamount(max);
          // seteditableAmountString(maxDisplay.toString());
        } else {
          // console.debug(`updateAmount value: ${value} <= max ${max}`);
          setamount(value);
          // seteditableAmountString(strValue);
        }

        // const intValueBI = BigInt(e.currentTarget.value.toFixed(0))
        // e.currentTarget.value


        // const balance = BigInt(e.currentTarget.value);
        // setamount();
        // setBalanceFilter(balance.toString());
        // setamount(BigInt(e.currentTarget.value));
        // seteditableAmountString(e.currentTarget.value);

      } catch (error) {
        console.error(`updateAmount e.currentTarget.value: ${e.currentTarget.value} error: ${error}`);
      }
    }
  /*   ,
    [editableAmountString]
  ); */
 // updateAmount

// ---
/*
  // trigger Balance computations for display
  useEffect(() => {
    // console.debug(`TokenInstanceEditableAmount.tsx useEffect balance:${balance} decimals:${decimals} `)
    if (amount) {
      const balanceValue = balance.valueOf();// + 1n;
      // console.debug(`TokenInstanceEditableAmount.tsx useEffect balanceValue:${balanceValue} decimals:${decimals} `)
      const intValue = ( balanceValue / (10n**BigInt(decimals)) );
      // console.debug(`TokenInstanceEditableAmount.tsx useEffect balance:${balance} decimals:${decimals} intValue:${intValue} `)
      // console.dir(intValue)
      const decimalValue = (balanceValue - intValue * (10n**(Decimals)));
      // console.debug(`TokenInstanceEditableAmount.tsx useEffect balanceValue:${balanceValue} decimals:${decimals} decimalValue:${decimalValue} `)
      if (decimalValue > 0) {
        const decimalDisplay = decimalValue.toString().padStart( decimals, "0");
        seteditableAmountString(`${intValue}.${decimalDisplay}`)
        // console.debug(`TokenInstanceEditableAmount.tsx useEffect balanceValue:${balanceValue} decimals:${decimals} decimalDisplay:${decimalDisplay} `)
      } else {
        seteditableAmountString(`${intValue}.0`)
      }
    } // if amount
    else {
      // console.debug(`TokenInstanceEditableAmount.tsx useEffect amount is null/0`)
      seteditableAmountString(`0`)
    }

    return () => { };
  }, [ // balance,
  decimals,
  // , status 
  , // tokenInstance.userData[accountAddress as any]?.amount]
   amount]);
*/

  // trigger Balance computations for display
  useEffect(() => {
    // console.debug(`TokenInstanceEditableAmount.tsx useEffect balance:${balance} decimals:${decimals} `)
    if (amount) {
      const amountValue = amount.valueOf();// + 1n;
      // console.debug(`TokenInstanceEditableAmount.tsx useEffect balanceValue:${balanceValue} decimals:${decimals} `)
      // const intValue = ( amountValue / (10n**BigInt(decimals)) );
      const intValue = ( amountValue / (10n**(Decimals)) );
      // console.debug(`TokenInstanceEditableAmount.tsx useEffect balance:${balance} decimals:${decimals} intValue:${intValue} `)
      // console.dir(intValue)
      const decimalValue = (amountValue - intValue * (10n**(Decimals)));
      // console.debug(`TokenInstanceEditableAmount.tsx useEffect balanceValue:${balanceValue} decimals:${decimals} decimalValue:${decimalValue} `)
      if (decimalValue > 0) {
        const decimalDisplay = decimalValue.toString().padStart( decimals, "0");
        seteditableAmountString(`${intValue}.${decimalDisplay}`)
        // console.debug(`TokenInstanceEditableAmount.tsx useEffect balanceValue:${balanceValue} decimals:${decimals} decimalDisplay:${decimalDisplay} `)
      } else {
        seteditableAmountString(`${intValue}.0`)
      }
    } // if amount
    else {
      // console.debug(`TokenInstanceEditableAmount.tsx useEffect amount is null/0`)
      seteditableAmountString(`0`)
    }

    return () => { };
  }, [decimals, amount, Decimals]);

  // ---
/* 
  useEffect(() =>
    {
      console.debug(`TokenInstanceEditableAmount.tsx useEffect editableAmountString:${editableAmountString} amount:${amount} `)
      // if (editableAmountString == "0") {
      if (amount == 0n) {
        // seteditable(false);
        if (unSelect) {unSelect()};
      }
    },
    [editableAmountString,]
  );
 */
  // ---

  useEffect(() =>
    {
      // console.debug(`TokenInstanceEditableAmount.tsx useEffect editableAmountString:${editableAmountString} amount:${amount} `)
      // if (editableAmountString == "0") {
      if (amount == 0n) {
        // seteditable(false);
        if (unSelect) {unSelect()}
      }
    },
    [ amount, unSelect ]
  );

  // ---

  // const clsTextSize = "text-xs sm:text-sm md:text-base"
  // const clsTextThin = "font-light " + clsTextSize
  // const clsTextBold = "font-normal " + clsTextSize
  // const clsTextPadding = "p-2 "
  // const clsText = clsTextPadding + (balance.valueOf() > 0n ? clsTextBold : clsTextThin)
  // const clsTextDisabled = clsText + " text-center opacity-60"

  // console.debug(`TokenInstanceEditableAmount.tsx render`)

  // ------------------------------

  return (
    <>
      {
        editable && balance && balance > 0n ?
          <>
            <div className="flex flex-row justify-left">
              <div className="flex grow-0 m-0 pr-1 p-0 ">
                <label className="swap swap-rotate">
                  <input type="checkbox" checked={transferAmountLock} onChange={()=>{}} />
                  <LockClosedIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-base-content swap-on fill-current" onClick={() => { setLockAmount() }} />
                  <LockOpenIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-base-content swap-off fill-current" onClick={() => { setUnLockAmount() }}/>
                </label>
              </div>
              <div className={"join join-vertical " + (transferAmountLock? "font-semibold text-accent-content opacity-50":"font-normal text-base-content")}>
                <input type="number"
                  value={editableAmountString} onChange={(e)=>{updateAmount(e)}}
                  step={0.001} min={0} max={10_000_000_000_000}
                  readOnly={transferAmountLock}
                  className="input input-bordered text-xs sm:text-sm md:text-base h-6" placeholder="...">
                </input>
              </div>
              <div className="flex grow-0 m-0 p-0 ">
                <label className={"swap swap-rotate "+ (transferAmountLock?"invisible":"visible")}>
                  <input type="checkbox" checked={(amount&&amount>0n?false:true)} onChange={()=>{}} />
                  <PlusCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-base-content swap-on fill-current" onClick={() => { setZeroAmount() }} />
                  <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-base-content swap-off fill-current" onClick={() => { setMaxAmount() }} />
                </label>
              </div>
            </div>
          </>
          :
          <div className="flex flex-row justify-left">
            <div className="flex grow-0 m-0 pr-1 p-0 invisible">
              <label className="swap swap-rotate">
                <input type="checkbox" />
                  <LockClosedIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-base-content swap-on fill-current" onClick={()=>{}} />
                  <LockOpenIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-base-content swap-off fill-current" onClick={()=>{}} />
              </label>
            </div>
            <div className={"join join-vertical " + "font-light text-base-content opacity-60"}>
              <input type="text"
                  value={editableAmountString}
                  readOnly={true}
                  className="input input-bordered text-xs sm:text-sm md:text-base h-6">
                </input>
            </div>
            <div className="block grow-0 m-0 p-0">
            </div>
          </div>
      }
    </>
  );
}

// ------------------------------

export { TokenInstanceEditableAmount }