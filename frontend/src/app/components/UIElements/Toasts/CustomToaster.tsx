// React
import { useMemo } from 'react'
// Toast
import { Toaster, toast, resolveValue } from 'react-hot-toast'
import { Transition } from "@headlessui/react";
// Consts
import { TOAST_DEFAULT_POSITION } from '@uiconsts/uiConsts'
// Styles
import { TOAST_OPACITY_TW, clsToastIconSize, clsToastPending } from "@uiconsts/twDaisyUiStyles";
// Icons
import { XCircleIcon } from '@heroicons/react/24/solid'

export default function CustomToaster(): JSX.Element {

  const toastDefaultStyle = useMemo(
    () => ({}), []
  );

  const toastsPosition = useMemo(
    () => ({ top: 20, left: 20, bottom: 20, right: 20 }), []
  );

  return (
    <Toaster
      position={TOAST_DEFAULT_POSITION}
      gutter={20}
      toastOptions={toastDefaultStyle}
      containerStyle={toastsPosition}
    >
      {(_toast) =>
        <Transition
          appear
          show={_toast.visible}
          className={`transform p-2 m-0 block alert w-auto shadow-lg border border-black border-dotted ` + (_toast.type == "loading" ? "alert-info" : `alert-${_toast.type}`)}
          enter="transition-all duration-150"
          enterFrom="opacity-0 scale-50"
          enterTo={`opacity-${TOAST_OPACITY_TW} scale-100`}
          leave="transition-all duration-150"
          leaveFrom={`opacity-${TOAST_OPACITY_TW} scale-100`}
          leaveTo="opacity-0 scale-75"
        >
          <div className="grid grid-cols-12 gap-0 m-0 p-0">
            {_toast.duration == Infinity ?
              <>
                <div className={"mt-1 " + clsToastPending} />
                <div className="p-0 pr-1 pt-1 m-0 col-span-11">{resolveValue(_toast.message, _toast)}</div>
              </>
              :
              <>
                <div className="-p-0 m-0"><button onClick={() => toast.dismiss(_toast.id)}><XCircleIcon className={clsToastIconSize} /></button></div>
                <div className="p-0 pl-2 pt-1 m-0 col-span-11">{resolveValue(_toast.message, _toast)}</div>
              </>
            }
          </div>
        </Transition>
      }
    </Toaster>
  )
}