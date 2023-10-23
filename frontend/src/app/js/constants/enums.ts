
export enum EChainTokensListLoadState {
  notLoaded = 0,
  contracts = 1,
  sourceBalances = 2,
  decimals = 3,
  names = 4,
  symbols = 5,
  targetBalances = 6,
  transferAbility = 7,
  // watchTransfers = 8, // TODO
}

export enum EStepsLoadTokensData {
  contracts = 0,
  sourceBalances = 1,
  decimals = 2,
  names = 3,
  symbols = 4,
  targetBalances = 5,
  transferAbility = 6,
  // watchTransfers = 7, // TODO
}
