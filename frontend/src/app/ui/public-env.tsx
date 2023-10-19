import pick from 'lodash/pick'

import { getPublicKeys, environment } from '../environment'

// import type { getPublicKeys } from '../environment.server'
// import { environment } from '../environment.server'

type Props = ReturnType<typeof getPublicKeys>['publicKeys']
// type Props = ReturnType<typeof PublicEnv>
// type Props = ReturnType<typeof getPublicKeys>
declare global {
  interface Window {
    ENV: Props
    // publicKeys: Props
    // publicKeys: PublicEnv
  }
}
function PublicEnv(props: Props) {
  // debugger
  // console.debug(`PublicEnv.tsx render`)
  // console.debug(`PublicEnv.tsx render: props=${JSON.stringify(props)}`)
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.ENV = ${JSON.stringify(props)}`,
      }}
    />
  )
}

function getPublicEnv<T extends keyof Props>(key: T): Props[T] {
  // if (typeof window !== 'undefined' && !window.ENV) {
  if (typeof window !== 'undefined' && !window.ENV/* window.publicKeys */) {
      throw new Error(
      `Missing the <PublicEnv /> component at the root of your app.`,
    )
  }

  // return typeof window === 'undefined' ? environment()[key] : window.ENV[key]
  // return typeof window === 'undefined' ? environment()[key] : window.publicKeys[key]
  // return typeof window === 'undefined' ? environment()[key] : window.publicKeys[key]
  return typeof window === 'undefined' ? environment()[key] : window.ENV[key]
}

function getPrivateKeys() : TPrivateEnv {
  // return {
  //   privateKeys: pick(environment(), [
  //     'ALCHEMY_APIKEY',
  //     'INFURA_APIKEY',
  //     'WALLET_CONNECT_APIKEY',
  //   ]),
  // }
  // return (
  //   pick(environment(), [
  //     'ALCHEMY_APIKEY',
  //     'INFURA_APIKEY',
  //     'WALLET_CONNECT_APIKEY',
  //   ])
  // )
  return {
    privateKeys: pick(environment(), [
      'ALCHEMY_APIKEY',
      'INFURA_APIKEY',
      'WALLET_CONNECT_APIKEY',
    ]),
  }
}

export { PublicEnv, getPublicEnv, getPublicKeys, getPrivateKeys, environment }