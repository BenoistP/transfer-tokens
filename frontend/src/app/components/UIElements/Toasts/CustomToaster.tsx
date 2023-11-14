// React
import { useMemo } from 'react'
import { Toaster } from 'react-hot-toast'
// Consts
import {
  TOAST_DEFAULT_POSITION,
} from '@uiconsts/uiConsts'

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

  // ----------------------------------------------------------------------

  return (
    <Toaster
      position={TOAST_DEFAULT_POSITION}
      gutter={20}
      toastOptions={toastDefaultStyle}
      containerStyle={toastsPosition}
    />
  ) // render
}
export default CustomToaster;
