// React
import { useEffect, useCallback, useState } from "react";
// Icons
import { PlusCircleIcon, XCircleIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/solid'

// ------------------------------

const TokenInstanceEditableAmount = ( {
  selectable, readonly, balance,
  amount, setamount,
  transferAmountLock, settransferAmountLock,
  decimals, unSelect }: ITokenInstanceAmountProps ) => {

  // ---

  const [editableAmountString, seteditableAmountString] = useState("0") as [string, (balance:string) => void];
  const [editable, seteditable] = useState<boolean>(selectable)

  // ---

  const Decimals = BigInt(decimals);
  const MAX = balance;

  // ---

  const setMaxAmount = useCallback( () =>
    {
      seteditableAmountString(MAX.toString());
      setamount(MAX);
    },
    [MAX, setamount]
  );

  // ---

  const setZeroAmount = useCallback( () =>
    {
      seteditableAmountString("0.0");
      setamount(0n);
      if (unSelect) {unSelect()}
    },
    [setamount, unSelect]
  );

  // ---

  const setLockAmount = useCallback( () =>
    {
      if (settransferAmountLock) settransferAmountLock(true);
    },
    [settransferAmountLock]
  );

  // ---

  const setUnLockAmount = useCallback( () =>
    {
      if (settransferAmountLock) settransferAmountLock(false);
    },
    [settransferAmountLock]
  );

  // ---

  useEffect( () =>
    {
      seteditable(selectable)
    },
    [selectable]
  );

  // ---

  const updateAmount = /* useCallback( */
  (e: React.FormEvent<HTMLInputElement>): void =>
    {
      try {
        const strValue = e.currentTarget.value;

        const strInt = strValue.split('.')[0]
        const strFloat = strValue.split('.')[1]

        const leadingZeros:number = strFloat?.match(/^0+/)?.[0].length || 0
        const floatValue = strFloat ? BigInt(strFloat) : 0n
        const intValue = BigInt(strInt)

        const amountValueInt =  BigInt(Math.pow(10, decimals)) * intValue ;
        const amountValueFloat = BigInt(Math.pow(10, decimals-(/* 1+ */leadingZeros+floatValue.toString().length))) * floatValue ;

        const value = amountValueInt + amountValueFloat

        if (value > MAX) {
          setamount(MAX);
        } else {
          setamount(value);
        }
      } catch (error) {
        console.error(`updateAmount e.currentTarget.value: ${e.currentTarget.value} error: ${error}`);
      }
    }

  // ---

  /**
   * trigger Balance computations for display
   */
  useEffect(() => {
    try {
      if (amount) {
        const amountValue = amount.valueOf();// + 1n;
        const intValue = ( amountValue / (10n**(Decimals)) );
        const decimalValue = (amountValue - intValue * (10n**(Decimals)));
        if (decimalValue > 0) {
          const decimalDisplay = decimalValue.toString().padStart( decimals, "0");
          seteditableAmountString(`${intValue}.${decimalDisplay}`)
        } else {
          seteditableAmountString(`${intValue}.0`)
        }
      } // if amount
      else {
        seteditableAmountString(`0`)
      }
    } catch (error) {
      console.error(`TokenInstanceEditableAmount.tsx useEffect error:${error} `)
    }
  }, [decimals, amount, Decimals]);

  // ---

  useEffect(() =>
    {
      try {
        if (amount == 0n) {
          if (unSelect) {unSelect()}
        }
      } catch (error) {
        console.error(`TokenInstanceEditableAmount.tsx useEffect error:${error} `)
      }
    },
    [ amount, unSelect ]
  );

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
            readonly ?

            <div className="flex flex-row justify-left">
              {editableAmountString}
            </div>


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