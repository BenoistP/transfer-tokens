import { ETHEREUM_CHAIN_ID, GNOSIS_XDAI_CHAIN_ID } from '@jsconsts/chainIds';
import { isAddress, getAddress } from 'viem'
import { ADDRESS_MAX_SIZE, NULL_ADDRESS } from "@jsconsts/addresses";

const NULLNULL_ADDRESS = NULL_ADDRESS+NULL_ADDRESS
const regexp0x = new RegExp('^(0[xX])(.*)$');

export const checkAndFixAddress0xFormat = (_address:string|undefined) : TAddressString  => {
  if (_address) {
    let addressSliced = _address.toLowerCase()
    while (addressSliced.slice(0,4) == NULLNULL_ADDRESS) {
      // remove leading 0x duplicates
      addressSliced = addressSliced.slice(2, )
    }
    // shorthen to max address size
    addressSliced = addressSliced.slice(0, ADDRESS_MAX_SIZE)
    if (regexp0x.test(addressSliced)) {
      return addressSliced as TAddressString;
    }
    // add 0x prefix
    return '0x' + _address as TAddressString;
  }
  // return empty address with leading 0x if undefined
  return '0x';
}

// ---

export const isValidAddress = (address:string) : boolean  => {
  // const regexp0x = new RegExp('^0x[a-fA-F0-9]{40}$');
    try {
    const addressLC = address?.toLowerCase()
    if (addressLC) {
      if (addressLC.startsWith('0x')) {
        if (addressLC.length === 42) {
          return isAddress(addressLC)
        }
      } else {
        if (addressLC.length === 40) {
          return isAddress('0x'+addressLC)
        }
      }
    }
  } catch (error) {
    console.error('isValidAddress error', error);
  }
  return false;
}

// ---

export const checksumAddress = (address:TAddressString) : TAddressString  => {
let addressChecksummed = address;
try {
  let checksummed = "";
  if (address) {
    const addressLC = address.toLowerCase()
    try {
      checksummed = getAddress(addressLC)
    } catch (error) {
      console.error('checksumAddress getAddress error', error);
    }
    if (checksummed.startsWith('0x') ) {
      addressChecksummed = checksummed as TAddressString;
    }
  }
} catch (error) {
  console.error('checksumAddress error', error);
}
  return addressChecksummed;
}

export const isChainSupported = (chainId:TChainIdNullUndef) : boolean => {
  if (chainId) {
    if (chainId === ETHEREUM_CHAIN_ID || chainId === GNOSIS_XDAI_CHAIN_ID) {
      return true;
    }
  }
  return false;
}

export const shortenAddress = (address:TAddressStringEmptyNullUndef) : TAddressString => {
  if (address) {
    if (address.length > 10) {
      return address.substring(0, 6) + '...' + address.substring(address.length - 4, address.length) as TAddressString;
    }
  }
  return "0x";
}
