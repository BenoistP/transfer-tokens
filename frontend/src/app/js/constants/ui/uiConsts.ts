
// Consts
import {
  DURATION__TEN_SECONDS,
  DURATION__THIRTY_SECONDS,
  DURATION__SIXTY_SECONDS,
} from '@jsconsts/consts'

const DEFAULT_GNOSIS_ICON_URL='https://gnosisscan.io/images/svg/brands/main.svg'

const DEFAULT_GNOSIS_EXPLORER_BASE_URI='https://gnosis.blockscout.com'
const DEFAULT_ETHEREUM_EXPLORER_BASE_URI='https://eth.blockscout.com/'

const DEFAULT_GNOSIS_EXPLORER_TX_URI='/tx/'
const DEFAULT_ETHEREUM_EXPLORER_TX_URI='/tx/'

// Toasts durations
const DURATION_SHORT = DURATION__TEN_SECONDS
const DURATION_MEDIUM = DURATION__THIRTY_SECONDS
const DURATION_LONG = DURATION__SIXTY_SECONDS

// // const TOAST_TOP_RIGHT_POSITION = {position: 'top-right'}
const TOAST_BOTTOM_RIGHT_POSITION = 'bottom-right'
// const TOAST_BOTTOM_RIGHT_POSITION_OBJ = { position: TOAST_BOTTOM_RIGHT_POSITION }

// const TOAST_DEFAULT_POSITION_OBJ = TOAST_BOTTOM_RIGHT_POSITION_OBJ
const TOAST_DEFAULT_POSITION = TOAST_BOTTOM_RIGHT_POSITION

// // export const TOAST_DEFAULT_POSITION = TOAST_BOTTOM_RIGHT_POSITION

// const MESSAGE_SEPARATOR = "\n"

// // Toasts types
// const TOAST_MESSAGE_TYPE_SUCCESS = 10
// const TOAST_MESSAGE_TYPE_INFO = 20
// const TOAST_MESSAGE_TYPE_WARN = 30
// const TOAST_MESSAGE_TYPE_ERROR = 40

// Metamask: MetaMask Tx Signature: User denied transaction signature.
// Rabby: TransactionExecutionError User rejected the request.


const USER_REJECT_TX_REGEXP = /user\s+(rejected|denied)/i;

const DURATION_TX_TIMEOUT = DURATION__SIXTY_SECONDS * 2;


const FETCHDATA_MULTICALL_MAX_RETRY = 5;
const FETCHDATA_MULTICALL_SUCCESSSTATUS = "success";

export {

  DURATION_SHORT,
  DURATION_MEDIUM,
  DURATION_LONG,

  DEFAULT_GNOSIS_ICON_URL,

  DEFAULT_GNOSIS_EXPLORER_BASE_URI,
  DEFAULT_ETHEREUM_EXPLORER_BASE_URI,

  DEFAULT_GNOSIS_EXPLORER_TX_URI,
  DEFAULT_ETHEREUM_EXPLORER_TX_URI,

  // TOAST_DEFAULT_POSITION_OBJ,
  TOAST_DEFAULT_POSITION,

  // MESSAGE_SEPARATOR,

  // // Toasts types
  // TOAST_MESSAGE_TYPE_SUCCESS,
  // TOAST_MESSAGE_TYPE_INFO,
  // TOAST_MESSAGE_TYPE_WARN,
  // TOAST_MESSAGE_TYPE_ERROR,

  USER_REJECT_TX_REGEXP,
  DURATION_TX_TIMEOUT,
  FETCHDATA_MULTICALL_MAX_RETRY,
  FETCHDATA_MULTICALL_SUCCESSSTATUS
}
