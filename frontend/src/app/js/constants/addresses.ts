export const ADDRESS_PREFIX = "0x";
export const DEFAULT_TARGET_ADDRESS = ADDRESS_PREFIX;
export const ADDRESS_MIN_SIZE = 40;
export const ADDRESS_MAX_SIZE = ADDRESS_MIN_SIZE+2; // '0x'
export const NULL_ADDRESS = "0x"+"0".repeat(ADDRESS_MIN_SIZE) as TAddressString;

const DEAD = "dEaD"
export const DEAD_ADDRESS = ADDRESS_PREFIX + "0".repeat(ADDRESS_MIN_SIZE-DEAD.length) + DEAD as TAddressString;