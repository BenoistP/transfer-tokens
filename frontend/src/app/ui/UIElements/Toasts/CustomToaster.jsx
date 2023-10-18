// React
import React from 'react'
import { useMemo } from 'react'

import { toast, Toaster, ToastBar } from 'react-hot-toast'
// Tailwind
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '/tailwind.config.js'


// Icons
// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark as faSolid_Xmark } from '@fortawesome/free-solid-svg-icons'

// React router
// import {
//   Link
//  } from "react-router-dom"

// Consts
import {
  // PATH__MY_COLLECTION,
  TOAST_DEFAULT_POSITION,
  // DURATION_SHORT,
  // DURATION_MEDIUM,
  DURATION_LONG,
} from '@js/ui/uiConsts'


const CustomToaster = ( {/**/} ) =>
{
  // console.debug(`CustomToaster: `)

  // Tailwind
  const twFullConfig = resolveConfig(tailwindConfig)

  const toastsStyles = useMemo(
    () => (
      {
        style: {
          background: twFullConfig.theme.colors['greyMVa'].light,
          border: '1px solid black'
        },
        icon: '⌛',
        success: {
          style: {
            background: twFullConfig.theme.colors['tealMVa'].dark,
            border: '1px solid black',
          },
          duration: DURATION_LONG,
          icon: '✓',
        },
        error: {
          style: {
            background: twFullConfig.theme.colors['orangeMVa'].light,
            border: '1px solid',
          },
          duration: DURATION_LONG,
          icon: '🕳',
        },
      }
    ), 
    [twFullConfig.theme.colors]
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

  return (
    <Toaster
      position={TOAST_DEFAULT_POSITION}
      gutter={44}
      toastOptions={toastsStyles}
      containerStyle={toastsPosition}
    >
      {(t) => (
        <ToastBar
          toast={t}
          // // style={{
          // //   ...t.style,
          // //   animation: t.visible ? 'custom-enter 1s ease' : 'custom-exit 1s ease',
          // }}
        >
          {/* {({ icon, message }) => (
            <>
              {
               (t.type == 'loading'  ?
               <>
                {icon}
                {message}
               </>
              :
                <>
                  <button onClick={() => toast.dismiss(t.id)}>
                  </button>
                  <FontAwesomeIcon icon={faSolid_Xmark}/>
                  {icon}
                  {message}
                </>
              )
              }

            </>
          )} */}
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              {t.type !== 'loading' && (
                <button onClick={() => toast.dismiss(t.id)}><FontAwesomeIcon icon={faSolid_Xmark}/></button>
              )}
            </>
          )}
        </ToastBar>
      )}
</Toaster>

  ) // render
}
export default CustomToaster;
