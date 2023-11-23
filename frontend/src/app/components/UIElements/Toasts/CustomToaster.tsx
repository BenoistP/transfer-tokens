// React
import { useMemo } from 'react'
import { Toaster, ToastIcon, toast, resolveValue } from 'react-hot-toast'
import { Transition } from "@headlessui/react";
// Consts
import {
  TOAST_DEFAULT_POSITION,
} from '@uiconsts/uiConsts'
// Styles
import { clsToastIconSize, clsToastPending } from "@uiconsts/twDaisyUiStyles";
// Icons
import { /* LinkIcon, */ XCircleIcon } from '@heroicons/react/24/solid'

const CustomToaster = ( ) =>
{

  const toastDefaultStyle = useMemo(
    () => (
      {
      }
    ), 
    []
  );

  const toastsPosition = useMemo(
    () => (
      {
        top: 20,
        left: 20,
        bottom: 20,
        right: 20,
      }
    ),
    [ ]
  );

  // ---

  type TToastTypes = "loading" | "success" | "error" | "info" | "blank" | "custom"
  interface IBaseToastProps {
    type: TToastTypes
  }

  // ---

  const BaseToast = ( {type = "info"}:IBaseToastProps ) =>
  {
    return (
      <div className={`block alert alert-${type} w-auto p-2 m-0`}
      style={{
        opacity: 0.85,
        transition: "opacity 100ms ease-in-out",
        border: '1px solid black',
      }}
      >
      </div>
    )
  }

  // ----------------------------------------------------------------------

  return (
    <Toaster
      position={TOAST_DEFAULT_POSITION}
      gutter={20}
      toastOptions={toastDefaultStyle}
      containerStyle={toastsPosition}
    >

      { (_toast) => {
console.log(`toast: ${_toast.type}`)
console.dir(_toast)
          return (
            <Transition
              appear
              show={_toast.visible}
              className={`transform p-4 block alert w-auto shadow-lg `+ (_toast.type == "loading" ? "alert-info" : `alert-${_toast.type}` ) }
              enter="transition-all duration-150"
              enterFrom="opacity-0 scale-50"
              enterTo="opacity-80 scale-100"
              leave="transition-all duration-150"
              leaveFrom="opacity-80 scale-100"
              leaveTo="opacity-0 scale-75"
            >
              {/* {t.duration == Infinity && <div className={clsToastPending}/>} */}
              
              {/* <p className="px-2">{resolveValue(_toast.message)}</p> */}


              <div className="grid grid-cols-8 gap-0 m-0 p-0">
                    
                      {/* <span className="loading loading-dots loading-xs"></span> */}
                      {_toast.duration == Infinity ?
                        <>
                          <div className="p-0 pr-1 pt-1 m-0 col-span-7">{resolveValue(_toast.message)}</div>
                          <div className={"mt-1 "+clsToastPending}/>
                        </>
                      :
                        <>
                          <div className="-p-0 m-0"><button onClick={() => toast.dismiss(_toast.id)}><XCircleIcon className={clsToastIconSize} /></button></div>
                          <div className="p-0 pl-2 pt-1 m-0 col-span-7">{resolveValue(_toast.message)}</div>
                        </>
                      }
                      {/* {_toast.visible && } */}
                      
{/* 
                    <div className="p-0 pl-1 pt-1 m-0 col-span-7">
                      {`${t("moveTokens.stepThree.transfer.awaitConfirm")}: ${getAmountShortString(_tokenInstanceToTransfer.transferAmount, _tokenInstanceToTransfer.decimals)} ${_tokenInstanceToTransfer.name} ${t("moveTokens.stepThree.transfer.successTo")} ${shortenAddress(_to)}`}
                    </div>
                    <div className="col-span-8">
                      <Link className="flex justify-end underline" to={getTxUri(_transferTxHash)} target="_blank" rel="noopener noreferrer" >
                      {t("moveTokens.stepThree.transfer.txHash")}<LinkIcon className="pl-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 fill-current" />
                      </Link>
                    </div>
 */}
              </div>

            </Transition>
        ) // return
      } // (t
      }
    </Toaster>

  ) // render
}
export default CustomToaster;