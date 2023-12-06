
const clsLoading = "loading-spinner"
const clsLoadingDots = "loading "+ clsLoading +" loading-xs md:loading-sm lg:loading-md"
const clsLoadingDotsSmall = "loading "+ clsLoading +" loading-xs"
const clsToastPending = clsLoadingDotsSmall

const clsLoadingList = clsLoadingDots
const clsLoadingTokenLists = clsLoadingList
const clsLoadingTokensInstancesList = clsLoadingList

const clsIconStatusSize = 'w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 stroke-2'
const clsIconMedium = 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-2'
const clsToastIconSize = clsIconMedium

const clsFlagIcon = "ml-2 flagCircle inline-block mr-2 hover:scale-110"

const clsTextSize = "text-xs sm:text-sm md:text-base"
const clsTextNormal = clsTextSize + " font-normal"
const clsTextLight = clsTextSize + " font-light"
const clsTextMedium = clsTextSize + " font-medium"
const clsTextSemibold = clsTextSize + " font-semibold"

const TOAST_OPACITY_TW = 90
const TOAST_OPACITY_ALPHA = TOAST_OPACITY_TW/100

export {
  clsLoadingTokenLists,
  clsLoadingTokensInstancesList,
  clsToastPending,
  clsToastIconSize,
  clsIconStatusSize,
  clsIconMedium,
  clsFlagIcon,
  clsTextNormal,
  clsTextLight,
  clsTextMedium,
  clsTextSemibold,
  TOAST_OPACITY_TW,
  TOAST_OPACITY_ALPHA
}