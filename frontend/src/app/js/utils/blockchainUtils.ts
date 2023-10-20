// import { ETHEREUM_CHAIN_ID, XDAI_CHAIN_ID } from '~/utils/constants/chainIds';
import { ETHEREUM_CHAIN_ID, XDAI_CHAIN_ID } from '@jsconsts/chainIds';
import { isAddress, getAddress } from 'viem'

export const checkAndFixAddress0xFormat = (address:string|undefined) : AddressString  => {

  if (address) {
    if (address.startsWith('0x')) {
      return address as AddressString;
    }
    return '0x' + address as AddressString;
  }
  return '0x';
}

export const isValidAddress = (address:string) : boolean  => {
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

export const checksumAddress = (address:AddressString) : AddressString  => {
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
      addressChecksummed = checksummed as AddressString;
    }
  }
} catch (error) {
  console.error('checksumAddress error', error);
}
  return addressChecksummed;
}

export const isChainSupported = (chainId:ChainId|undefined|null) : boolean => {
  if (chainId) {
    if (chainId === ETHEREUM_CHAIN_ID || chainId === XDAI_CHAIN_ID) {
      return true;
    }
  }
  return false;
}