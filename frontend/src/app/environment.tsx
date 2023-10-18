import pick from 'lodash/pick'
import * as z from 'zod'

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  // PUBLIC
  PUBLIC_ENABLE_TESTNETS: z.string().min(1),
  PUBLIC_APPNAME: z.string().min(1),
  PUBLIC_REALT_API_BASE_URL: z.string().min(1),
  PUBLIC_REALT_API_LIST_ALL_TOKENS: z.string().min(1),
  PUBLIC_MULTICALL_MAX_BATCH_SIZE: z.string().min(1),

  // PRIVATE
  ALCHEMY_APIKEY: z.string().min(1),
  INFURA_APIKEY: z.string().min(1),
  WALLET_CONNECT_APIKEY: z.string().min(1),
})

const environment = () => environmentSchema.parse(process.env);

function getPublicKeys() : TPublicEnv {
  // return (
  //   pick(environment(), [
  //     'PUBLIC_ENABLE_TESTNETS',
  //     'PUBLIC_APPNAME',
  //     'PUBLIC_REALT_API_BASE_URL',
  //     'PUBLIC_REALT_API_LIST_ALL_TOKENS',
  //   ])
  // )
  return {
    publicKeys: pick(environment(), [
      'PUBLIC_ENABLE_TESTNETS',
      'PUBLIC_APPNAME',
      'PUBLIC_REALT_API_BASE_URL',
      'PUBLIC_REALT_API_LIST_ALL_TOKENS',
      'PUBLIC_MULTICALL_MAX_BATCH_SIZE'
    ]),
  }

}

export { getPublicKeys, environment }