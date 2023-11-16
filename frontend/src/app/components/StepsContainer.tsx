// React
import { useCallback, useEffect, useMemo, useState } from "react";
// Components
import StepError from "@Components/StepError";
import Step0 from "@Components/Step0";
import Step1 from "@Components/Step1";
import Step2 from "@Components/Step2";
import Step3 from "@Components/Step3";
import MainContentContainer from "@Components/MainContentContainer";
// Context Hooks
import { useMoveTokensAppContext } from '@Providers/MoveTokensAppProvider/MoveTokensAppContext'
// Utils
import { getChainTokensList } from "@jsutils/tokensListsUtils";
// Wagmi
import { getContract, multicall } from '@wagmi/core'
import { useAccount } from 'wagmi'
// ABIs
import { erc20ABI } from '@wagmi/core'
import CoinBridgeToken from "@abis/CoinBridgeToken.json";
// Consts & Enums
import { PUBLIC_MULTICALL_MAX_BATCH_SIZE_DEFAULT } from "@uiconsts/misc";
import { EStepsLoadTokensData, EChainTokensListLoadState } from "@jsconsts/enums"; 

// Events
// import { /* GetFilterLogsParameters, */ parseAbiItem } from 'viem'
import { usePublicClient } from 'wagmi'
import { Log } from "viem";

// ------------------------------

const StepsContainer = ( {
  tokensLists,
  chainId,
  setpreviousDisabled, setNextDisabled,
  isLoadingTokensLists,
  isErrorTokensLists,
  setShowProgressBar,
  setmigrationState,
  setshowActivity,
 } :IStepsContainerProps ) => {

// ------------------------------

  const { address: connectedAddress, /* status, isConnected ,  isConnecting,  isDisconnected*/ } = useAccount()
  const { moveTokensAppData: { step = -1 }, moveTokensAppDataHandlers: { resetToInitialStep } } = useMoveTokensAppContext()

  const [selectableTokensLists, setselectableTokensLists] = useState<TSelectableTokensLists>(null)

  const [selectedChainsTokensList, setselectedChainsTokensList] = useState<TChainsTokensListArrayNullUndef>(null)
  const [tokensInstances, settokensInstances] = useState<TTokensInstances>(null)

  const [targetAddress, settargetAddress] = useState<TAddressEmpty>("")

  const [isLoadingTokensInstances, setisLoadingTokensInstances] = useState<boolean>(false)
  const [isErrorTokensInstances, setisErrorTokensInstances] = useState(false)

  // Sorting
  const [sortOrderTokenDisplayId, setsortOrderTokenDisplayId] = useState<TsortOrder>(0) // 0: unsorted, 1: lowest first , 2 highest first
  const [sortOrderTokenName, setsortOrderTokenName] = useState<TsortOrder>(0) // 0: unsorted, 1: lowest first , 2 highest first
  const [sortOrderTokenBalance, setsortOrderTokenBalance] = useState<TsortOrder>(0) // 0: unsorted, 1: lowest first , 2 highest first

  // Filtering
  const [nameFilter, setnameFilter] = useState<string>("")
  const [balanceGt0Filter, setBalanceGt0Filter] = useState<boolean>(true) // set checked by default (display only balance > 0)
  const [balanceFilter, setBalanceFilter] = useState<string>("")
  const [addressFilter, setaddressFilter] = useState<string>("")

  // Selection
  const [selectAll, setselectAll] = useState<boolean>(false);
  const [selectAllVisible, setselectAllVisible] = useState<boolean>(false);
  const [invertAll, setinvertAll] = useState(false)
  const [invertAllVisible, setinvertAllVisible] = useState(false)

  // ------------------------------

  const publicClient = usePublicClient(
    {
      chainId: chainId,
    }
  )

  const tokensAddresses = useMemo( () => {
    return (
    [
      '0xFe17C3C0B6F38cF3bD8bA872bEE7a18Ab16b43fB',
      '0x41599149f1B52035392402F9e311b1edb0C9f699',
      '0x315699f1BA88383CFF2F2f30FcaD187aDb2E4D72',
      '0x6F442Da588232DC57Bf0096E8dE48D6961D5CC83',
      '0x96700Ffae33c651bC329c3f3fbFE56e1f291f117',
      '0x499A6c19F5537dd6005E2B5c6E1263103f558Ba4',
      '0xB3D3C1bBcEf737204AADb4fA6D90e974bc262197',
      '0x73BdE888664DF8DDfD156B52e6999EEaBAB57C94',
      '0x830B0e9a5ecf36D0A886D21e1C20043cD2d16515',
      '0x4Cc53Ee5ef306a95d407321d4B4acc30814C04ee',
      '0xd9e89bFebAe447B42C1Fa85C590716eC8820f737',
      '0xeFe82D6baF0dB71f92889eB9d00721bD49121316',
      '0x8a9F904B4EaD6a97F3aB304d0D2196f5c602c807',
      '0x7E95b310724334FF74537dc08bfD3377d25E65Ce',
      '0x75f06B482adbFb04b877D8ee683E2FCDf18AD153',
      '0x3150f0EbC0eFEe280b5348b9C8C271AD44Eb8B13',
      '0x94Fa7F8cb8453AD57cd133363b3012044647078C',
      '0x175cbD54d38F58B530785e01471a2Ec0D4596EB5',
      '0xce111a198eB04F388AceB78c40ceD6daF1b0514a',
      '0xA29ae272bC89e5f315B2793925f700045F845d82',
      '0x34eD9e71449529E034d0326cfBB3b5ccDCa00CBC',
      '0xB5D30c28F87acf675Ed5B9f343E5ffF39eC9942C',
      '0x1Eb16EC378f0Ce8f81449120629F52ba28961d47',
      '0x4E98493920b16Dd6642e9D48497c8d0A49150f6F',
      '0x9A99f283e1F6c3b7F24901995624Ef7b78E94471',
      '0x9FEF44FC4C571010BCCD5b63e1Cdc807D3b347bF',
      '0x9856C5CA15A4Ac9C65AAC090c38a9f39EB3b5eeC',
      '0xe3902E329Ef2D3FD7666022C139d75BCc984b7a5',
      '0x7f940B5509a22e81D29167581bdEea3Fa5a0abEE',
      '0xD08d2b199E9E5df407427d4085877d1fDFf3b1d6',
      '0x9F923653A19537b5a1b003854A1920fe67a8ffEB',
      '0x08Ad1F3a48Be1D23C723a6cC8486b247F5dE935a',
      '0xD1c15CEbfDcd16F00D91666bf64C8b66CbF5e9b5',
      '0xA68b7779504b0AE372ddCC109f8786DB9B91e93e',
      '0x8626B38267e4FC0D8C92E0bB86F97Acab3f6AA05',
      '0x76dbEb740ecd1F3b052a9AFA302ABc7EB4Fb5390',
      '0x46F8A600337dec5CaB03aa9b8F67f1D5B788ce28',
      '0xE5Ce63AC9a08c1EB160889151cD84855F16C94d2',
      '0x67a83B28F6dd8C07301495eE2C6f83b73FD21092',
      '0x3C56D5E887D8fA7AE1Ba65BF7eCCC25eC09EAF18',
      '0x537DC65657eD455d1c17E319FE6F4926d6033f2b',
      '0xF23B80216a10E6f0c0D3b5AD5C9349e9425cAd40',
      '0xa69D7d4DdF397f3D1E7EbAf108555d1107b3B117',
      '0x806690B7a093d2Cf6419a515ABEdb7f28595bc5E',
      '0xEe2f2212a64Ec3f6BC0F7580e10c53CB38B57508',
      '0x92161385C9dE8798ad5fB01c0bE99fFcbC84dFD8',
      '0x400B5716B0c23B6f1f0f2A5fDb038949962B803E',
      '0x57eaDD2A542cFE9F00A37F55dF4D5062f857C0E8',
      '0x21f1aF3e751317a2F7De7Df31D5d092E6A907Bde',
      '0x9Eb90Ec3FAafC22092C9b91559FdDde538042093',
      '0xF18CfFB528eca0ea31D1d6b28BC80d2eca34D14D',
      '0x6Db6d540F5614e6BaB7475Af3F430F46a0B083e2',
      '0x741857c07b100c9C0C1272D95845dDdc4f1b67cB',
      '0x23684569c0636C9aEa246551879d457D0a0E6F58',
      '0xEeDc2F5F4D1226759B1AcF9EfA23a99661De6663',
      '0xa81F77E8988b28fB74243B907acE3c83353Dc80a',
      '0x021Bb23a45e9FC824260435e670fC383b7b8cbbB',
      '0x280e9ed3B20c580a2f4219657bB9332D80Bc01f1',
      '0x33722EA778dF197f1b7B1Cf0b124d7A962181d65',
      '0x750FA12Ae51d1515c893C1aaABE2C135937a2c8B',
      '0x730fBB27b650a2A3bcaA6729E635Dc255ACeE343',
      '0xC731EcA970979Cd2Da2a1094A808F49894070D35',
      '0x06D0e5Aee443093aC5635B709C8a01342E59Df19',
      '0x4d0dA4E75d40Bd7D9C4f7A292BF883BcDf38c45D',
      '0x9528a7402C0Fe85B817aa6E106EAFa03A02924c4',
      '0xdA47bD33e8f5d17Bb81b8752784bfb46C1c44B2A',
      '0xb5DD2b6E0A0422e069E1D2CC3Ed16533488a05e3',
      '0x92d31E19F88597F368825ba16410f263a844527A',
      '0x24293ab20159cfc0f3D7C8727CD827fbA63d4F64',
      '0x5E2a09064B2DCa8c44aaD8A5b69a69Bb1854fE72',
      '0xA9F30C907321718e655B74463CA665B690B78894',
      '0xb8403b7730368942a5BFe5aaC04a31B44015b1cc',
      '0x43fED9F9BF7DeedCb314b432a8e38219dd62CE9e',
      '0xff1B4D71Ae12538d86777A954b136cF723fCcEFD',
      '0x31AA5fA895Fd186fDE12347A6fCaf540875b6434',
      '0xBA07997F594A52DF179620284B52B50A4E66227D',
      '0xb09850e2B93aa3AAa1476bF0c007cfc960E2de79',
      '0xa137D82197Ea4cdfd5f008A91Ba816b8324F59E1',
      '0x1E001730A23c7EBaFF35BC8bc90DA5a9b20804A4',
      '0x9b5B4886033B4ABc5Eb0552ffF7c15A67C3c47C7',
      '0xD5d1adf54Fbf73a00b197DdCfDAD7cc27D93002f',
      '0xa2b2ae397492C7ed8A4c1e751aC72D2b59947E6b',
      '0x4a99cc509f7FaCF58D7B67E99236dB5e0921ef81',
      '0x5600e25b4f24c63Afa655C3bd96E3C178B654Fa1',
      '0x2adc1cfA726A45264A328D9d2e2C692ceac97458',
      '0xaD91999F534F4075B00bA4231C018e57bdeBb342',
      '0x211618Fa0934910666f2C2731101F5A3aC013fD8',
      '0x31820af2d43c08BD82Bd94B08974062482bD98D3',
      '0x8D1090dF790FFAFdACCda03015c05dF3b4cC9c21',
      '0x1FdB4015fD5E031C5641752C1e03B973ad5eA168',
      '0xe82CBb7C29d00a4296EE505d12a473C26cd9c423',
      '0x63A1849b47eF5913ccc5adb0E2708b11A4Ba6972',
      '0xE255cAF8893382465368b8e1cd4Ef8436ACf0ADE',
      '0x69D1B42b20f3DED07bEC322253D0140b04Cbb6F5',
      '0xD5Fc0C4C4C5ff316e1E91494d963Ff1D52Ba25fF',
      '0x311FC485f1FeA0c8Cc9b5c783E79f4313DDFa720',
      '0x804f6baa10615c85e4b4a5bc4efe516d9f7a4365',
      '0x969d42ad7008e6651e1fd52742153f8743225d98',
      '0xe7b6de709ffc3bd237c2f2c800e1002f97a760f3',
      '0x9D918eE39a356bE8eF99734599c7e70160dB4Db6',
      '0xDd833D0eEF6d5d7Cec781b03c19f3B425F3039Df',
      '0x8fcB39A25e639C8fbD28E8a018227D6570E02352',
      '0xF4657AB08681214Bcb1893aa8E9C7613459250ec',
      '0xe887DC4fcb5240c0c080AEAb8870421d3ebd0B28',
      '0x5b690b010944bDfA8B26116967FE3fB3c38cFAaC',
      '0x38DE2858be53d603B1104f16aA67cf180002465d',
      '0x78A9013B53d2d255935BbC43112d0dd3f475F3D3',
      '0x0954682ff1b512d3927d06c591942f50917e16a0',
      '0xcb061ae1f9b618c44ac10a47a672bf438da01fd8',
      '0xF5aeAB9D9c707b56311066e5172239686AB88110',
      '0x9b091105B9A9EB118F4E0dA06A090D6D95463357',
      '0x4471962eeffEC57A33fa4e0793EFEEC07684dFFB',
      '0x584967356bad1499c10a8695522983F2fB7d88F3',
      '0x8c1c77c549a3f233fa8f8dea133ff5415d9bae11',
      '0xcdf955df8a7ae1264f3b4f8ee5fa68507e8528aa',
      '0x394d59797495848934acf61e680c1739a2cd8cfd',
      '0x950bc24510274163aabf83339424e7b49bf6a0c0',
      '0x26ccc79ceeec918e01bbd5c04a64767919f9ec1a',
      '0xca4e38439D5D86554431E15ecEd03B8bcf2abDDd',
      '0x6Bd094E39d0B839689e2F900BFDd180b10df62d7',
      '0x81CEA1a7c83d5caeD483Dd4Da59bfE98f24Ef687',
      '0x328249eFca026aE8596E9AFE913C5F8775eF60AE',
      '0x46B00B4bF04c2c94aE67576004a3a247B9400ade',
      '0x10C2c7a5342988818eb6726faE369299d8FB6328',
      '0x0C12f2b2c3aD5150D344b6D3ABB901b4795D72d9',
      '0x8c3761C5d489eE5a5C30f874b5220C769a7C5a16',
      '0xD3f7130940c7746298D9778F79e7BBA4C552f176',
      '0xeF2B6234E376C3b152c5Febe47E1cA3C73cDAA9f',
      '0xA5c16ae5Fd75f4F079f3E33f0124899Bacf567f9',
      '0x1d5dA20522b1b94E3B7d983c954075Da429BBaE1',
      '0x23BB1314b73AaAa888800B177Ad5D9719a51195b',
      '0xC363eA8a468B3970Ef93140D5D4ad9D124178F6e',
      '0x7389Ef988Fae6b3bcf520000c535E1E2D94C5427',
      '0xD1095B31F41D3BDBb66A52B94a737b2D7Ac17635',
      '0xa8aB830BfD0d91Bc017cdEc98a2a198B9938ea8d',
      '0xaFD76591d02462cCE1AA5b6c6430854AA9a17E56',
      '0x690602Eb0BF5607E3586F1d3e4C4601ef6E4A89F',
      '0x185e39d860cf86fbecf4a7c341bd1545ea3a41b9',
      '0x24A2558d0B0b2247A64eab7cf09d7244CB4c9597',
      '0xcD7DC5e034B631331Bc0cFC4EA71d2Dc7b53c338',
      '0x2360FcA74ed948Ff4F962E369080A64A40A1300D',
      '0xc7785A2575606d444CefbC8A22591600Ae5aa9b4',
      '0x5162d60b699A44B9F09B5Fbfd8e6343cDE9d7B22',
      '0x2B683F8cC61dE593F089bdDDc01431c0D7CA2EE2',
      '0x83B16B1dcaAeb59caa13b96Da260d8b15671822a',
      '0xdE9122799c313d5cc5C4385984156AD068CdE331',
      '0x9D19B4d771ef67EA1dA64699A388133b44Eb434c',
      '0x4505F5bFF6bAdA5a20b1A008c6Db3CD9545027a4',
      '0x79e18a519d60c2ef7e18aac08d60ba0d4eee2511',
      '0x18E55343ECFc135E21916fcdb9788acCB5B53cAF',
      '0xb2960e73b260812e4326723c7136e7b1988a036a',
      '0xe23a5fc3502976de653cb64e5c27dc01d700db36',
      '0x945d833927380e25f402350667c6cd2d2615e7c2',
      '0x96510c0bafc5b3305d2b468063f7b3f8e8389802',
      '0x062f0732a7daca652c3bd7d8ad51c3a920b25962',
      '0x5e29f1b62c15658e76671e199a7f16afddc9ad76',
      '0x529ff4d9b07acd6366d0c3eb077ebaa2b06e71c4',
      '0x3D2129D9ceed93992CeA3Ee7D8E44754FaEDc922',
      '0x6133a54E3895F478ee6AaE582d7DBC7bBb086b7d',
      '0x8c60eCcAB34FfCe7b54E985FC8B7BA280b45701d',
      '0xb890b3cc0f2874b15b0dbf6377d39c106ca29fbf',
      '0x934e4bed6f85295581697002fadd816b07c03406',
      '0x744Ca59499BE33F6A112Eed3ACCA533954dA1050',
      '0x20170890ef210E402578F97D6B179784C45F3a1b',
      '0xCCCA5323052435Aa4b0eC94c1d0255f17E4f495C',
      '0x306044777e68eC5C323889468baacbA6d2705994',
      '0x052Ad78E3aA0b0F2D3912FD3b50a9a289CF2f7Aa',
      '0xA5fD99f142EbF4343974137a3200e5197bF0C81b',
      '0x8a25F83819FdA66ff0fC6567c8327A5F154c2ec6',
      '0xbdC1F8ccD117FE4e34f6c78f5293cD126b0C0474',
      '0x009bAB289f104699AE87e576294D18eD505FAa61',
      '0xE447E8EC034c9100c1fF9BC401B5Cd2fe15c9dcC',
      '0x062c208073c9b439d1973262CFe0DDD88f38afa8',
      '0x2fB7eeEecE8498AF2bF5b00Ea29CA03005C35956',
      '0xCfe61Eff2CDE5C5885bA3A649AB092F56BD2830F',
      '0xa6004Ca1faB428152f27135355F21D6BcDF355Bd',
      '0x964eE9E5d9d8abFc768F8D860cC6c33E75d37112',
      '0x0d5d0B74c690170a82Bf52E5d16388fC4Fa29082',
      '0x27DCc5DE7ee468C2da8BF2FD21E60348747223Cc',
      '0xdf7a80778a8be812e654291ffab21d61e9c21323',
      '0x2e1a7d86e4591ebe5662ce6b5e3601f19a626c22',
      '0x960e61F5c4107D71bd8936B010416738c250f91c',
      '0x1707a9bad232d728afded75faced38ec90eaa41e',
      '0x07da3cDaE2396aA826387a48Deba5868d7Deb7bc',
      '0xF13d215776dAC65c9c1E80D8F3daF6D91CC062d5',
      '0xEe2daCc1E9264cbCb19C46863373fbFf4Ba7a9Bd',
      '0x5D0436F003AEF56990194f79A242Bc185843aEa5',
      '0x5d9eB5fc910176B08efA5f8D13812b85fDf3394B',
      '0xaC0d5dBfEd881b3ffaeBc7152bC2Bc23464FE0cC',
      '0xd88E8873E90f734C9D3e3519e9e87345478c1df2',
      '0xe919dF5F4eff1e6e6c6FE7C82471A5e6Ce3437f1',
      '0x994C698175e5dBe405a46dF94FBD54999A3676c2',
      '0x65d81BF81a65b177012B323F14970071c5099226',
      '0xc8ED28cE508811216030B96e2Dc70883abAd5408',
      '0x3839Ab8550a64940964E0ECb02ED301005A96FfC',
      '0xf7412e264FA85AE5e79ac3A4B64cE4669E32B98f',
      '0xAfA816f7fFF6f252E5CdBD40b80d9eF77B7e289B',
      '0x2089b1b815A2FD0187a48a1C66C511DA828a8128',
      '0xF793d1ba72E2914525205cA592DEC2142E700CB4',
      '0xef0c14c5d7da4d0447c28da7a9c8145d0a5a6f61',
      '0x75645f349DA40702710599ac41ADEF6e7e700DBE',
      '0x03CBe3DDa83908ad48643D6A1B5b13d11ACAF845',
      '0x7A684f6d9a34175d642EEdB31FA545604d8d3aCF',
      '0xe2FBdeADC82c71C1b8bFf9CA4f9E7666224A362c',
      '0x5B571D103e670848ce8CdE37f93821c9c93c7c43',
      '0x4B293baA4703c5e7d480498BF3ccd8Dc3D1297Cd',
      '0xc6a9ad5f687b832636E8a946Be5F5F213Dd563fA',
      '0x3113bb5E8BF9Dc44EcDB111e5C4ab0818015a2E1',
      '0x6f5258fEB5862b661829315841b0718D6e56CA2c',
      '0xc1c1031e4A44B98707203480029e6576CB3267e3',
      '0x19A6a39B746c4647A01a3Bf80751155969DDb15A',
      '0x97Cc36Cd93c8A4933c5870768B49F073062477a1',
      '0x4b9C173c81EA2B6804b99ac91846c62bdB74Fe72',
      '0x91CEF0e64c0059AffF516418304761C772dDFeC8',
      '0x7909090541D646A262a3062639298772a2c79dAA',
      '0x270c59B84C5b56564CB7C418FbF2Df1d1efa7e04',
      '0x304Bee450c2D116696d8B442981e7a300dfdf1CB',
      '0xF63b6B88ccC49825dB9b2C6710a3B4513AdB58C3',
      '0x64d69276CC78aDbb6d5fEa95d3e6370b4844dC76',
      '0x61eE29983Da5D006a56b549e1543b8196dF159A5',
      '0xdaF6b273691372E4EB2Fe353624F8F4f768C2099',
      '0x53ceBce6BD24f8e14da85bA0627A92336Bd4F515',
      '0xCACd674995bb591E6BbE0177E5404EcD0fa91B55',
      '0xB80173756781960761AA59c9eEEBE191F049f4C8',
      '0x0fd357eA71AD533c6b8A62520321Ed286Ed9a0C2',
      '0x9d4cF0316442e23eAc10AAFE4423305685597F78',
      '0xa984E4C759bEA433BeF9239736d5f9a9af0e7389',
      '0xF549B95362e6062999bdfe6c61E75e4547B8116D',
      '0x8c33B8F55bBaE1770813a9e855CD4C6da327896d',
      '0x9EeA197BF77Fd70F485F25E606b731ce3c510b2C',
      '0x034eCb6dc0608B73765f2965771A003D940eE8b2',
      '0x30a4E022287aA6bfE9ea96f5ad8482ff9Af8C357',
      '0xCAf963cD253CF81664ecBCAd71D043C47edF77FB',
      '0xf98Be7dDAB511622b5dE91039C48f1f2E37D0Bc1',
      '0xF8A00E1a560aC95ae807dADC261013CA91F8497B',
      '0x9Abff92Ddd896F3F7664ec232bb0A5dB027D6724',
      '0xC3dCBdED5A38b94479D48375Bea4B1F69630906d',
      '0x70fD4CbC25b086693260F0307B29D88eeA4d71B5',
      '0x7DFeee178FC1F929A88ad69E4e8D493600dD26D0',
      '0x82a6E0E7598447Be0C173971394cC4Fc71CE6Ac3',
      '0x219c820c2d25D8937601D8713235B556C4A37f62',
      '0x795E43d6914C9c391DE268837F437EcDcD77F5E3',
      '0xbb32dE53a057F29280aD889A92Fe99D69D470ef0',
      '0xFc5073816Fe9671859EF1e6936EFd23BB7814274',
      '0xf8c1ADe28b78678449494114F18a6c1B785BBF76',
      '0xe5B46b4c5c7F974e55DeD0b0099c02774f0023c1',
      '0x3B22445411B429f665d12F7A55DD16DFac22C6aE',
      '0x7Ad92301442b73BED8d9696d704Ac24a0fEF3B69',
      '0x2F3640655D076b45d1fA10da0f6D880329c9d553',
      '0xDcfE90e59B574839E028EC28E78018B84B6FcdAb',
      '0x27C30545DC2BA4B3BfdCb9F807A0214F4b06f034',
      '0x9Ea9b45a500dd4346163Ce7483dEA2294ae88d1D',
      '0x7FACB63aFB928AC5A4650acC6EAB701d7a8Becb5',
      '0x43ab521302fF36039BE6b425DDAeA5Ec30a0f8b5',
      '0xA14d2507a2b96Adc13CB19642802FD4EaF9a8a32',
      '0xa3bb6EA63C0fBf259E16ffe0586d84b2C83d7229',
      '0x10cDE9d1E1a2d3B703f037a6788e04bc139CdF6f',
      '0xEA91A67A23943984Bc8017E20C9FD2E40fD38C3D',
      '0x1106d8755FFaFb1f1820b3668e354336d9085A12',
      '0x7085c30B97F1aF202F8dFec174f1E07D8f8f887D',
      '0x4c0c0Fe9Ca9aD4Bc748EB8F596DDcfD8707a5cD4',
      '0xe1C4610477da28f6852CeD5666AA6f3CCBd73b02',
      '0xBf1a3181167E4979fD121eF247D9aF4Fc884CC46',
      '0x940b60023484d593B8391521704abB063b5ccCF0',
      '0xd84D9C58a93e3d4b0acc5Ab5a5aA5E2Fa6B7ab75',
      '0xA48Ddf8D4F9b03c63d6340B5E0D2AF293Ab516Ea',
      '0x2F4974a3BE7355CF8915aB34099F35ed44293128',
      '0x2e1db155a7b812f3Fcb0dBC8eD3164b4705213B4',
      '0x2A7C9f7719367006E9Bd20d0555025eFB86d7d5D',
      '0x06cc12368fA6A3D4dc0872C60331156a21cDcc9C',
      '0x06246100bA403608B98ADfb006D82A7484f5D9ff',
      '0x3c5654362fA005393Ad9c793FE0fa74F0Cd95Bbb',
      '0x377d14927BbC274771daA9fFAb0722935dAfAFFA',
      '0xf3c4c10ab96f9B6d7719De63f4219f69078Df976',
      '0xA12a334F563c1a9fef29cF11fAc7E148fd54463b',
      '0x9642a2379Bc359c8B10Ead2E06c4A4156Bbb3F57',
      '0xEDcDDC374C78BB8596352a28faf1EBa9874aa2e1',
      '0xD67ba795ca466A85bE46b13763adCb729BE49A82',
      '0x87b2fB660f790b936e42093036E0b519F0b50b24',
      '0xD79e63912dbeB409ea350138503A9eb29d73728F',
      '0xBaBC257B4958556Bda696E7705cf535F400d8b09',
      '0x954f393fF46DA9cFc07A9052D7C669710cf48eD4',
      '0x59dE64861dDF9309bE2d03d647d21C7a7609e384',
      '0xA6231A14bDB99ba817c211558FA8ebB2A74B959a',
      '0x458b169D6D9D5d021d61013E3A01bF7dee29DD90',
      '0x3AC16e7177a55D5fd8F8aB58263D1c764D462fDE',
      '0x2F5BB131614d6C2BE8520E355752576Ad55416B4',
      '0x12413a603d16893D8F406925289f206b3B974Cf0',
      '0x0c84153FDcAfd65a4536c2d8d4856E6a6457fB21',
      '0x1d9Fd5c3FbFd4758F22438a336068b813872cEfC',
      '0x88F37cEE57B669CC1557D4f353dC11c113873F0B',
      '0xB7c1C306bFf953dF8997cC8D91949B7AFf36772b',
      '0x86b4f8135A39DC349A963969F33C3D030726cf61',
      '0x7524d382373c1a091789978A8b2C1DC707D2B213',
      '0x6F0E040d9F02830c6eea5b287AD74369a9E5F1E1',
      '0x016E0081FcAad345691027908D5044534BcA1946',
      '0xA9e20a86d66493FD146abb9A1f946864773Ce0ae',
      '0x820629dB01bB56A62Bc75aEeF6EB8dfb0Eec1d04',
      '0xb5fb9e224A5Cc76E61928eA7985d251520a5579c',
      '0x47a544a460ED29D6622A6f6E68De7f873Cc30e67',
      '0x9aFDd1e3EEc7985b9Dcc3dA1ed030498ea031a6C',
      '0x591882dC0581A69f377dF4CaD2CeE4E9855ef34D',
      '0xf9a932df2010bd3d0e0f47bc61b7104ab82874da',
      '0x032f0e16b729210551642f3249f6e0b1b52a63be',
      '0x60888b47Eb7290EaA8823568FCFFA17Da1A853D9',
      '0x8236067c1b6dc176ebda95531168e93bbcee25b0',
      '0xd8b9c3c10ba1d9f926b94b45859b65b2900e49bb',
      '0x6c76cB9Ff41B40F75Fe8424268370A6c58f8468a',
      '0x717bfbfa88859ac34f9772d92749c4b384c6b479',
      '0x7804e5ae01bb68e5a07a40b109ece66a66772d5e',
      '0x3e98281a3dc794799159732d5a488e6cea645c37',
      '0xd63265bbe136deff4f26e5976d21840c25df5e7a',
      '0x92ea0f03b611e7e6d056371a3c6b2bb188199c47',
      '0x5cc180bf9091a2284624567ee3c5a2a465656301',
      '0xcb2928d422cc2f349bfb67ee74113a3101a58cb4',
      '0x20c1216e14cb307a0987eaeae4b7c7f3888ad538',
      '0x5c001ccc6340421590a200a328b1d7fc7d454964',
      '0x02b5d51e29fa35c9228cfa3ff968da6aaf1048dd',
      '0x19d01c13e6e5a1a990db9821358a591583f63234',
      '0x4637aa1a13aa4050c6e4bcd6dde9c39e80e9dd54',
      '0x01b4ea64e4204b51cbc8463ffc8e6046c9d70371',
      '0x550a0c95fe1762d9cb553402ccc65bcd71594692',
      '0x67f685a20fb55ac5e7d128d66a13bdbe77599136',
      '0xd018c66416f3fb6e96f1ad2a758677e1e019e3fb',
      '0xe4c74c3852cb088e49a010fb0b79159859623da2',
      '0x40074c412154562fb16441106c95900467e9c173',
      '0xc49297c99f880f5f19df4ac988eba4df03ef6333',
      '0xdd79587c22d7b2a68c0aa0752a6f83b1d77556cd',
      '0x9dfaa0b7b69f39632ad514cfaba2997cf5b58360',
      '0xc4a58f3746663bc22a0da17846b5f9c6b8ab4876',
      '0x1cc42015d1e4c97d8739d8fe663c47f0a49e9a38',
      '0xc38e84bcc2d2693dd77d89f2b86a83e7fe98afa5',
      '0x56aa13dd3b1e3f6ec9281b36ce2fe943a217ceb4',
      '0x3c20f694df207edd49408cf722898bc9002287b9',
      '0xb87798476389475cbc96d63aa801b7d25c50d5f1',
      '0x2b86741b2fbb1ddb8e7387965cf22ec656a38dc1',
      '0x8f0ef86efe4f2eba5f7a7bf4d0f3b6bc5681a7a7',
      '0xf96bcf8a5d9fa5258bcf243feb43500a2174abd6',
      '0x4326972a016d707c5c6bc854398aabb6780c62e9',
      '0x053b0bd329dc21bd4fa278f62310f668c5f1a6ed',
      '0x34a1a58de8ff7ea0a690888d9b8ae646a8480fa4',
      '0x14b0d23238c5277f8243d2739c005480d8022fe0',
      '0x2c12648dfa8d69c441b6b308c7d76661c1e6d1e7',
      '0x3f8ecb2d158cde11587270ab3f9744e0f3108354',
      '0x22c9f21f3be50863997e4e2e4f8f2686be79ec93',
      '0x7318c373695f8f3c8987a158d41d65eed4badb25',
      '0x969e3e55c8a4d9c4cd5e2660a2000ae12aad9e3e',
      '0x2010c480b73fd0865b6d2f164660da852d178d5d',
      '0x9dfd50ac7cb60832bf7b1c7c46204efcbd2cc959',
      '0xc2fb83f45c53d2194a9ee82e4bda3ee2120141f5',
      '0x140d6cfde793f1a2eed5274454aa6f463ec8c075',
      '0x72f1d0719d8ce0b03d35def98e5dbb17854ab285',
      '0x712d9c2b3077111493b8867c218f0d24a8aaf059',
      '0x80effd75fa30b8b89997d2522b3283a1e768f1bc',
      '0x16b18b9836fd01f1413b1bca28935ac00a1f43ce',
      '0x53279e01efda8c67404ce98462b831611d5dcca2',
      '0x5d0f382a64acb0fff716bf2f786b9df4dc8dad0c',
      '0x80d2956433a1622c336480ba5357350a30644c0a',
      '0xb061e8da0b08c8647516921af6a49b81d425f09f',
      '0x90d280b6456f8233e115e6aabb2ca89249dafd39',
      '0x30107f6f95b946c4ea0eaeb9f7ae436078f971b1',
      '0x79a956cf468ee592d6aef9ce06920989654b1ce3',
      '0xbd42a15a05d51158ca3c46cfd26fb19476f91ce6',
      '0xcc21b161171b181aa9cd7226a2c484175afd1fed',
      '0x60677266d8bedd6147e7070adfd8c681e2d88324',
      '0x18cc3ce7ed17e47c669982b6c94a0fe2a0b9606e',
      '0x3fe8dda02a469043c36a45ca74d624d9362ec2fc',
      '0xfb260178c2c0e5f920adea3dcc906bee4fea8a27',
      '0x4df8c0990e1f02810d6a27c452cd70b39f2e0a2c',
      '0x30d0e37cd8c87153d56e85bb4a45a0afdb1df4e5',
      '0x883646e436238811d2ebc309891779dbacb0e917',
      '0xf552ac17a396487f233a696bf52b82bf53080c6d',
      '0xae3713ac3717fa539e98618a03e99a68443f5789',
      '0x19f824662ba9df78e368022f085b708fccc201c8',
      '0xe90e02790f5070fb89b15863e2dbc3c22532b43e',
      '0xe7e80e20ce71acd578b18c54382567385771cc37',
      '0x5f51b44cdbdd5dc9aecabc2ed80e2b2a8c002866',
      '0x7231cafcb32d2ad7072b7bee71ca9d4e5ebffafa',
      '0x5a7715cf01a08ff1903a240c339fe5e884c01dcf',
      '0xa6662b6c605afb2cd635b2511efb10a04a08e79b',
      '0x632fac8692861960b0d928cf6e91ff703ef5c9f5',
      '0xdfdc10a5dbb68d36782a0933678dc187ec1c2ea4',
      '0x8e1de7a9fd1b1b2d761a448d63c4429377624843',
      '0x70724f4332d7ee1918f71236c1746cdda732d90a',
      '0x60139f99ddb56b846b998a655de2d775acd936a1',
      '0xaee6ded2c8723c1d81d1b5325a2e620fb055b77b',
      '0xd0ef2feeef879eb6ceb23a7809f6bb39e13ff0a8',
      '0xb0bd62447ec79ae63407f34d27cb7e536c28179e',
      '0x0e6a3fa67194ae6594edbe96153e28eefd2982f0',
      '0xec72022809156fb57564c8c3412e62dbc46298c3',
      '0x617e80813da122f0a25e09a731664b5530b8745c',
      '0x1a1ec5ef70a643cd35376214e8a8f2ea0d92931d',
      '0x988b40198194ea79fd650d1c61db996b7dcd0780',
      '0x7505ecf9cef3bc8c34f02bf7547921d2058f3d35',
      '0xd1bf0f64eba2f8babfdf71de3e5cc9e33f97a46a',
      '0x4d6876bd8d2f44d64b13a83a58cef81860329ef4',
      '0xab269dcd4a424cb8fa9432adc37d021c3d183578',
      '0x69075fe74ea11c5da9d32af3d8d6971b11b55d88',
      '0xce0ef526bdc57064fe556a9b2614eeb66608892f',
      '0x7d3f9309822a47e41dd4756dbe162580e2546f33',
    ] as TAddressString[]
    )
  },
  [],
  )

  // ---

  const processTransferEvent = useCallback( (logs:Log[]) =>
    {
      try {
        console.debug(`StepsContainer.tsx processTransferEvent typeof logs: ${typeof logs}`);
        console.dir(logs)

        if (logs && logs.length) {
          logs.forEach( (log:Log) => {

            const tokenInstance = tokensInstances?.find( (tokenInstance:TTokenInstance) => {
              return tokenInstance.address === log.address
            })
            if (tokenInstance) {
              console.debug(`StepsContainer.tsx processTransferEvent tokenInstance: ${tokenInstance.address}`);
              // if (log.)
              // tokenInstance.userData
            }
          })
        }
      } catch (error) {
        console.error(`StepsContainer.tsx processTransferEvent logs: ${logs} error: ${error}`);
      }
    },
    [tokensInstances]
  ); // processTransferEvent

  // ---

  useEffect(() => {
/*
    const getFilter = async () => {
      const publicClient = getPublicClient()
      const transferEvent = erc20ABI[1]
      const filter = await publicClient.createEventFilter(
        {
          address: ['0x...'],
          // event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'), 
          event: transferEvent
        }
      ) // createEventFilter
        return filter
    }

    const waitEvent = async (_filter: GetFilterLogsParameters) => {
      const logs = await publicClient.getFilterLogs( _filter )
      console.log(logs)
    }
*/
/*
  const waitEvent = async () => {

    const filter = await publicClient.createEventFilter({
      address: tokensAddresses,
      event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
      // fromBlock: 16330000n, 
      // toBlock: 16330050n 
    })

    const logs = await publicClient.getFilterLogs({ filter })
    console.dir(logs)
   
  }
*/

  // ---

    const waitEvent = async ():Promise<any> =>
    {
      const unwatch = publicClient.watchContractEvent({
        address: tokensAddresses,
        abi: erc20ABI,
        eventName: 'Transfer',
        onLogs: (logs:Log[]) => {
          // console.log(logs)
          processTransferEvent(logs)
          // console.dir(logs)
        }
      })
      return unwatch
    } // waitEvent


      // const unwatch = waitEvent().then( (unw) => {
      //   return unw
      // })
      
    waitEvent()

      /* return () => {
        unwatch()
      } */
    }, [processTransferEvent, publicClient, tokensAddresses]
  )
  



  // Filter

  const updateNameFilter = useCallback(
    (e: React.FormEvent<HTMLInputElement>): void =>
      {
        try {
          setnameFilter(e.currentTarget.value);
        } catch (error) {
          console.error(`StepsContainer.tsx updateNameFilter e.currentTarget.value: ${e.currentTarget.value} error: ${error}`);
        }
      },
      []
  ); // updateNameFilter

  // ---

  const updateBalanceFilter = useCallback(
    (e: React.FormEvent<HTMLInputElement>): void =>
      {
        try {
          setBalanceFilter(e.currentTarget.value);
        } catch (error) {
          console.error(`StepsContainer.tsx updateBalanceFilter e.currentTarget.value: ${e.currentTarget.value} error: ${error}`);
        }
      },
      []
  ); // updateBalanceFilter

  // ---

  const switchBalanceGt0Filter = useCallback(
    (): void =>
      {
        try {
          setBalanceGt0Filter(!balanceGt0Filter);
        } catch (error) {
          console.error(`StepsContainer.tsx switchBalanceGt0Filter error: ${error}`);
        }
      },
      [balanceGt0Filter]
  ); // switchBalanceGt0Filter

  // ---

  const updateAddressFilter = useCallback(
    (e: React.FormEvent<HTMLInputElement>): void =>
      {
        try {
          setaddressFilter(e.currentTarget.value);
        } catch (error) {
          console.error(`StepsContainer.tsx updateAddressFilter e.currentTarget.value: ${e.currentTarget.value} error: ${error}`);
        }
      },
      []
  ); // updateAddressFilter

  // ---

  const clearAllFilters = useCallback(
    (): void =>
      {
        try {
          console.debug(`StepsContainer.tsx clearAllFilters`);
          setaddressFilter("");
          setBalanceFilter("");
          setnameFilter("");
          setBalanceGt0Filter(false);
        } catch (error) {
          console.error(`StepsContainer.tsx clearAllFilters ${error}`);
        }
      },
      []
  ); // clearAllFilters

  const tokenInstanceFilterParamsUpdaters = {
    updateNameFilter, switchBalanceGt0Filter, updateBalanceFilter, updateAddressFilter, clearAllFilters
  }

  // ---

  const tokenInstanceFilterParams = useMemo(() => {
    return {
      name: nameFilter, balanceGt0: balanceGt0Filter, balance: balanceFilter, address: addressFilter
    }
  }, [nameFilter, balanceGt0Filter, balanceFilter, addressFilter]);

  // ---

  const filterTokenInstance = useCallback( (token:TTokenInstance) =>
    {
      const filterTokenInstanceWithFilterProps = (filter: ITokenInstanceListFilterStates, token:TTokenInstance) =>
      {
        try {
          const nameFilter = filter.name && token.name ? token.name.toLowerCase().includes(filter.name.toLowerCase()) : true ;
          if (!nameFilter) return false ; // RETURN

          const balanceGt0Filter = filter.balanceGt0 ? (token.userData[/* accountAddress */ connectedAddress as any]?.balance || 0) > 0 : true ;
          if (!balanceGt0Filter) return false ; // RETURN
    
          if (filter.balance) {
            const balanceSplit = filter.balance.split('.')
            const intPart:string = balanceSplit[0]
            const intValueBI = BigInt(intPart)
            const floatPart:string = balanceSplit[1]
            const leadingZeros:number = floatPart?.match(/^0+/)?.[0].length || 0
            const floatValue = floatPart ? BigInt(floatPart) : 0n
            const filterValueInt =  BigInt(Math.pow(10, token.decimals)) * intValueBI
            const filterValueFloat = BigInt(Math.pow(10, token.decimals-(leadingZeros+floatValue.toString().length))) * floatValue
            const filterValue = filterValueInt + filterValueFloat
            const balanceFilter = filter.balance && token.decimals ? (token.userData[/* accountAddress */ connectedAddress as any]?.balance || 0) >= filterValue : true ;
            if (!balanceFilter) return false ; // RETURN
          }
          const addressFilter = filter.address && token.address ? token.address.toLowerCase().includes(filter.address.toLowerCase()) : true ;
          return addressFilter; // RETURN
        } catch (error) {
          console.error(`StepsContainer.tsx filterTokenInstanceWithFilterProps error: ${error}`);
          return true; // error : skip and RETURN TRUE
        }
      }

      try {
        return filterTokenInstanceWithFilterProps(tokenInstanceFilterParams, token)
      } catch (error) {
        console.error(`StepsContainer.tsx filterTokenInstance error: ${error}`);
        return true; // error : skip and RETURN TRUE
      }
    },
    [connectedAddress, tokenInstanceFilterParams]
  ) // filterTokenInstance

  // ------------------------------

  // Sort

  const sortByTokenDisplayId = useCallback( () => {
    if (sortOrderTokenDisplayId === 0) {
      setsortOrderTokenDisplayId(1)
    } else if (sortOrderTokenDisplayId === 1) {
      setsortOrderTokenDisplayId(2)
    } else {
      setsortOrderTokenDisplayId(0)
    }
  }, [sortOrderTokenDisplayId] );

  // ---

  const sortByTokenName = useCallback( () => {
    if (sortOrderTokenName === 0) {
      setsortOrderTokenName(1)
    } else if (sortOrderTokenName === 1) {
      setsortOrderTokenName(2)
    } else {
      setsortOrderTokenName(0)
    }
  }, [sortOrderTokenName] );

  // ---

  const sortByTokenBalance = useCallback( () => {
    if (sortOrderTokenBalance === 0) {
      setsortOrderTokenBalance(1)
    } else if (sortOrderTokenBalance === 1) {
      setsortOrderTokenBalance(2)
    } else {
      setsortOrderTokenBalance(0)
    }
  }, [sortOrderTokenBalance] );

  // ---

  const sortOrderParams = { displayId: sortOrderTokenDisplayId, tokenName: sortOrderTokenName, tokenBalance: sortOrderTokenBalance } as ISortOrderParams

  // ---

  const sortTokensInstances = (a:TTokenInstance, b:TTokenInstance) =>
  {
    try {
      if (sortOrderParams.displayId === 0) {
        if (sortOrderParams.tokenName === 0) {
          if (sortOrderParams.tokenBalance === 0) {
            return 0
          }
          const aBalance = a.userData?.[connectedAddress as any].balance || 0n
          const bBalance = b.userData?.[connectedAddress as any].balance || 0n
          if (sortOrderParams.tokenBalance === 1) {
            const compAMinusB = aBalance - bBalance
            return Number(compAMinusB)
          } else {
            const compBMinusA = bBalance - aBalance
            return Number(compBMinusA)
          }
        }
        else if (sortOrderParams.tokenName === 1) {
          if (a.name) {
            return a.name?.localeCompare(b.name??"")
          }
          return -1
        }
        else {
          if (b.name) {
            return b.name?.localeCompare(a.name??"")
          }
          return -1
        }
      } else if (sortOrderParams.displayId === 1) {
        return a.displayId - b.displayId
      } else {
        return b.displayId - a.displayId
      }
    } catch (error) {
      console.error(`StepsContainer.tsx sortTokensInstances error: ${error} connectedAddress=${connectedAddress}`);
      return 0
    }
  } // sortTokensInstances

  // ------------------------------

  // Selection

  const updateCheckAll = useCallback(  (tokensInstances:TTokensInstances) =>
    {
      try {
        if (tokensInstances && connectedAddress) {
          const isAllChecked = tokensInstances.every( (tokensInstance) => {
              if (tokensInstance.selectable && tokensInstance.transferAmount) {
                  return tokensInstance.selected;
              }
              return true; // not selectable OR no amount : RETURN TRUE
            } // every
          );
          setselectAll(isAllChecked);
        } else {
          // Empty list
          setselectAll(false);
        }
      } catch (error) {
        console.error(`StepsContainer.tsx updateCheckAll error: ${error}`);
      }
    },
    [connectedAddress]
  ); // updateCheckAll

    // ---

  const updateCheckAllVisible = useCallback(  (tokensInstances:TTokensInstances) =>
    {
      try {
        if (tokensInstances && connectedAddress) {
          const isAllChecked = tokensInstances.every( (tokensInstance) => {
              if (tokensInstance.selectable && tokensInstance.transferAmount&&filterTokenInstance(tokensInstance)) {
                  return tokensInstance.selected;
              }
              return true; // not selectable OR no amount OR not visible : RETURN TRUE
            } // every
          );
          setselectAllVisible(isAllChecked);
        } else {
          // Empty list
          setselectAllVisible(false);
        }
      } catch (error) {
        console.error(`StepsContainer.tsx updateCheckAll error: ${error}`);
      }
    },
    [connectedAddress, filterTokenInstance]
  ); // updateCheckAllVisible

  // ---

  const handleCheckSelectAll = useCallback(
    (filter:boolean=false) =>
      {
        try {
          if (tokensInstances) {
            const newCheckAll = (filter?!selectAll:!selectAllVisible);
            const tokensInstancesCheckAll = tokensInstances.map((tokensInstance) => {
              if (  tokensInstance.selectable && targetAddress && tokensInstance.userData &&
                    tokensInstance.userData[targetAddress as any].canTransfer &&
                    tokensInstance.userData[connectedAddress as any].canTransfer &&
                    (tokensInstance.userData[connectedAddress as any].balance||0n) > 0n &&
                    tokensInstance.transferAmount > 0n
                  )
              {
                if (filter) {
                  if (filterTokenInstance(tokensInstance)) {
                    tokensInstance.selected = newCheckAll;
                  }
                } else {
                  tokensInstance.selected = newCheckAll;
                }
              }
              return {
                ...tokensInstance,
              } as TTokenInstance;
            });
            settokensInstances(tokensInstancesCheckAll);
            if (filter) {
              setselectAllVisible(newCheckAll);
              updateCheckAll(tokensInstancesCheckAll);
            } else {
              setselectAll(newCheckAll);
              updateCheckAllVisible(tokensInstancesCheckAll);
            }
          } // if (tokensInstances)
        } catch (error) {
          console.error(`StepsContainer.tsx handleCheckSelectAll error: ${error}`);
        }
      },
      [tokensInstances, connectedAddress, targetAddress, selectAll,
      filterTokenInstance,
      updateCheckAll,
      selectAllVisible, updateCheckAllVisible
    ]
  ); // handleCheckSelectAll

  // ---
  
  const handleInvertAllChecks = useCallback(
    (filter:boolean=false) =>
      {
        try {
            if (tokensInstances) {
              const tokensInstancesInvertCheck = tokensInstances.map((tokensInstance) => {
                if (tokensInstance.selectable) {
                  if (tokensInstance.userData && targetAddress && tokensInstance.userData[connectedAddress as any]
                    && tokensInstance.userData[connectedAddress as any].canTransfer
                    && tokensInstance.userData[targetAddress as any].canTransfer
                    && tokensInstance.transferAmount>0
                    ) {
                    if (filter) {
                      if (filterTokenInstance(tokensInstance)) {
                        tokensInstance.selected = ! tokensInstance.selected;
                      }
                    } else {
                      tokensInstance.selected = ! tokensInstance.selected;
                    }
                  }
                }
                return {
                  ...tokensInstance,
                } as TTokenInstance;
              });
              settokensInstances(tokensInstancesInvertCheck);
              if (filter) {
                setinvertAllVisible(!invertAllVisible);
              } else {
                setinvertAll(!invertAll);
              }
              updateCheckAll(tokensInstancesInvertCheck);
              updateCheckAllVisible(tokensInstancesInvertCheck);
          }
        } catch (error) {
          console.error(`StepsContainer.tsx handleInvertAllChecks error: ${error}`);
        }
      },
      [tokensInstances, invertAll, connectedAddress, targetAddress,
      filterTokenInstance,
      updateCheckAll, updateCheckAllVisible,
      invertAllVisible,
    ]
  ); // handleInvertAllChecks

  // ---

  const updateCheckboxStatus:IUpdateCheckboxStatus = /* useCallback( */
    (id: string, value: TChecked | undefined) =>
      {
        try {
          const tokensInstancesUpdated = tokensInstances?.map((tokenInstance) => {
            if (tokenInstance.selectID === id) {
              if (connectedAddress && tokenInstance.userData && tokenInstance.userData[connectedAddress as any]) {
                if (value) {
                  tokenInstance.selected = value.checked;
                } else {
                  tokenInstance.selected = !tokenInstance.selected;
                }
              } // if (accountAddress && ...
            } // if (tokenInstance.selectID === id)
            return {
              ...tokenInstance,
            } as TTokenInstance;
          })
          settokensInstances(tokensInstancesUpdated);
          updateCheckAll(tokensInstancesUpdated);
          updateCheckAllVisible(tokensInstancesUpdated);
        } catch (error) {
          console.error(`StepsContainer.tsx updateCheckboxStatus error: ${error}`);
        }
      }
      /* ,
      []
  );  */
  // updateCheckboxStatus

  // ---

  const updateTransferAmount:IUpdateTransferAmount = /* useCallback( */
    (id: string, amount: TTokenAmount) =>
      {
        try {
          const tokensInstancesUpdated = tokensInstances?.map((tokenInstance) => {
            if (tokenInstance.selectID === id) {
              tokenInstance.transferAmount = amount;
            } // if (tokenInstance.selectID === id)
            return {
              ...tokenInstance,
            } as TTokenInstance;
          })
          settokensInstances(tokensInstancesUpdated);
          updateCheckAll(tokensInstancesUpdated);
          updateCheckAllVisible(tokensInstancesUpdated);
        } catch (error) {
          console.error(`StepsContainer.tsx updateTransferAmount error: ${error}`);
        }
      }
      /* ,
      []
  );  */
  // updateTransferAmount

  // ---

  const updateTransferAmountLock:ITransferAmountLock = /* useCallback( */
    (id: string, value: boolean) =>
      {
        try {
          const tokensInstancesUpdated = tokensInstances?.map((tokenInstance) => {
            if (tokenInstance.selectID === id) {
              if (connectedAddress && tokenInstance.userData && tokenInstance.userData[connectedAddress as any]) {
                tokenInstance.transferAmountLock = value;
              } // if (connectedAddress && ...
            } // if (tokenInstance.selectID === id)
            return {
              ...tokenInstance,
            } as TTokenInstance;
          })
          settokensInstances(tokensInstancesUpdated);
        } catch (error) {
          console.error(`StepsContainer.tsx updateTransferAmountLock error: ${error}`);
        }
      }
      /* ,
      []
  );  */
  // updateTransferAmountLock

  // ---

  const tokensInstancesListTablePropsHandlers:ITokensInstancesListTableStatesHandlers = {
    sortStates: {
      sortOrderTokenDisplayId,
      sortOrderTokenName,
      sortOrderTokenBalance,
    },
    sortHandlers: {
      sortByTokenDisplayId,
      sortByTokenName,
      sortByTokenBalance,
      sortTokensInstances,
    },
    selectStates: {
      selectAll,
      selectAllVisible,
    },
    updateHandlers: {
      handleCheckSelectAll,
      handleInvertAllChecks,
      updateCheckboxStatus,
      updateTransferAmount,
      updateTransferAmountLock,
    },
    filterStates: {
      name: nameFilter,
      balanceGt0: balanceGt0Filter,
      balance: balanceFilter,
      address: addressFilter,
    },
    filterHandlers: {
      filterTokenInstance,
      tokenInstanceFilterParamsUpdaters,
    },

  } // as ITokensInstancesListTableStatesHandlers

  // ---

  const getSelectedTokenLists = useCallback( (selectableTokensLists:TSelectableTokensLists):TSelectableTokensLists =>
    {
      try {
        const selectedTokensLists = selectableTokensLists?.filter( (selectableTokensList:TSelectableTokensList) => {
          return selectableTokensList.selected && selectableTokensList.chainId == chainId
        })
        return selectedTokensLists;
      } catch (error) {
        console.error(`StepsContainer.tsx getSelectedTokenLists error: ${error}`);
        return null;
      }
    },
    [chainId]
  ) // getSelectedTokenLists

  // ------------------------------

  // Tokens Data init & loading

  const initTokenInstance = useCallback( (_token:TTokenChainData, _displayId:TDisplayId ): TTokenInstance|TNullUndef =>
    {
      if (_token?.address) {
        const tokenInstanceUserDataArray:TTokenInstanceUserData[] = new Array<TTokenInstanceUserData>()
        if (connectedAddress && typeof connectedAddress == 'string') {
          tokenInstanceUserDataArray[connectedAddress as any] = {
            balance: null,
            canTransfer: true, // warn: COULD BE FALSE for non transferable tokens, should be defaulted to false then checked with a multicall
          }
        }
        // debugger;
        const _tokenInstance = {
          chainId,
          type: (_token.extraData && _token.extraData.type ? _token.extraData.type : "ERC20" as TTokenType),
          address: _token.address,
          contract: null,
          decimals: 18,
          name: "",
          symbol: "",
          status: 0,
          displayed: true,
          displayId: _displayId,
          selectID: chainId+"-"+_token.address,
          selectable: false,
          selected: false,
          transferAmount: 0n,
          transferAmountLock: false,
          tr_processed: false, tr_error: false, tr_skipped: false,
          userData: tokenInstanceUserDataArray,
        }
        return _tokenInstance
      }
    },
    [chainId, connectedAddress]
  )

// ---

  const setStateLoadingTokensInstances = useCallback( (isLoading:boolean) =>
    {
      setisLoadingTokensInstances(isLoading)
    }, []
  )

  // ---

  const setStateErrorLoadingTokensInstances = useCallback( (isError:boolean) =>
    {
      setisErrorTokensInstances(isError)
    }, []
  )

  // ---

  const setStateIsFetchingData = useCallback( (isWorking:boolean) =>
    {
      setshowActivity(isWorking)
    }, [setshowActivity]
  )
  

  // ------------------------------

  const getMaxBatchSize = ( defaultBatchSize: number ) =>
  {
   let MAXBATCHSIZE = defaultBatchSize;
   try {
     const val = import.meta.env.PUBLIC_MULTICALL_MAX_BATCH_SIZE
     if (val) {
       MAXBATCHSIZE = Number.isSafeInteger(Number.parseFloat(val))
         ? Number.parseInt(val, 10)
         : defaultBatchSize;
       }
       return MAXBATCHSIZE
     } catch (error) {
     console.error(`StepsContainer.tsx getMaxBatchSize error: ${error}`);
     return MAXBATCHSIZE
   }
  } // getMaxBatchSize

  const MAXBATCHSIZE:number = useMemo( () =>
    {
      return getMaxBatchSize(PUBLIC_MULTICALL_MAX_BATCH_SIZE_DEFAULT)
    },
    []
  ) // MAXBATCHSIZE

  // ---

  const loadTokensContracts = useCallback( async(tokensInstances:TTokensInstances):Promise<TTokensInstances> =>
    {
      try {
        // console.debug(`StepsContainer.tsx loadTokensContracts`)
        const contractCoinBridgeTokenABI = JSON.parse(CoinBridgeToken.ABI)

        tokensInstances?.forEach( (tokenInstance:TTokenInstance) => {
          const abi = tokenInstance.type == "COINBRIDGE" as TTokenType ? contractCoinBridgeTokenABI : erc20ABI;
          // console.debug(`${tokenInstance?.address}`)
          if (tokenInstance?.address) {
            const contract = getContract({
              address: tokenInstance.address,
              abi,
            })
            tokenInstance.contract = contract;
          }
        })

        return tokensInstances
      } // try
      catch (error) {
        console.error(`loadTokensContracts error: ${error}`);
      } // catch (error)
    },
    []
  ); // loadTokensContracts

  // ---

  const fetchOnChainData = useCallback( async(multicallInput : any[] ) :  Promise<any[]>  =>
   {
    let multicallAllBatchesResult : any[] = [];
    try {
      //  throw new Error("fetchOnChainData error test")
       for (let i = 0; i < Math.ceil(multicallInput.length / MAXBATCHSIZE); i++) {
         const batch = multicallInput.slice(i * MAXBATCHSIZE, (i + 1) * MAXBATCHSIZE);
         const multicallBatchResult = await multicall({
           contracts: batch,
           // allowFailure: false, // disable error throwing
         }) // multicall

         multicallAllBatchesResult = multicallAllBatchesResult.concat(multicallBatchResult);
       } // for (let i = 0; ...

     } // try
     catch (error) {
       console.error(`StepsContainer.tsx fetchOnChainData error: ${error}`);
      setStateLoadingTokensInstances(false)
      setStateErrorLoadingTokensInstances(true)
     } // catch (error)
     return multicallAllBatchesResult;
    }
    ,
    [ MAXBATCHSIZE, setStateLoadingTokensInstances, setStateErrorLoadingTokensInstances /* , setErrorLoadingDataState */ ]
  ); // fetchOnChainData

  // ---

  const fetchOnChainDataWrapper = useCallback( async(multicallInput : any[] ) : Promise<any[]> =>
    {
      let multicallRes : any[] = [];

      try {
        const multicallInputCall = [] as any[] // contains real multicall inputs
        const inputRes = [] as any[] // contains inputs

        for (let i = 0; i < multicallInput.length; i++) {
          const element = multicallInput[i];

          if ( typeof(element) != "object" || !element.abi || !element.address || !element.functionName) {
            inputRes.push(element);
          }
          else { // if (typeof(element) != "object" || !element.abi ...
            multicallInputCall.push(element);
            inputRes.push(null);
          }
        } // for (let i = 0; ...
        let multicallFetchRes = [] as any[] // contains multicall results
        if (multicallInputCall.length>0) {
          multicallFetchRes = await fetchOnChainData(multicallInputCall);
        }
        if (inputRes.length>0) {
          // Merge
          let j = 0;
          for (let i = 0; i < inputRes.length; i++) {
            const element = inputRes[i];
            if (element) {
              multicallRes.push({result: element.value});
            } else {
              multicallRes.push(multicallFetchRes[j]);
              j++;
            }
          }
        } else {
          multicallRes = multicallFetchRes;
        }
        return multicallRes;
      } catch (error) {
        console.error(`StepsContainer.tsx fetchOnChainDataWrapper error: ${error}`);
        return multicallRes;
      }
      // finally {
      // }
    },
    [fetchOnChainData]
  ) // fetchOnChainDataWrapper

  // ---

  /**
   * Fetches token onchain data for:
   * - tokens balances of one address
   * requires tokensInstances to be initialized with tokenInstance.contract
   */
  const loadTokensOnChainData_addressBalances = useCallback(
    async(_tokensInstances: TTokensInstances, _resultOnly:boolean, _address:TAddressEmptyNullUndef): Promise<TTokensInstances> =>
    {
      try {
        // console.debug(`StepsContainer.tsx loadTokensOnChainData_addressBalances: GET ADDRESS TOKENS BALANCES`)
        if (_tokensInstances && _tokensInstances.length) {
          const multicallArray = _tokensInstances.map( async (token) => {
            if (token?.contract) {
              return {
                ...token.contract,
                functionName: 'balanceOf',
                args: [_address],
              }
            }
            return null;
          });
          const multicallData = await Promise.all(multicallArray);
          const onchainData = await fetchOnChainDataWrapper(multicallData); // Multicall
          if (onchainData?.length > 0) {
            const tokensInstancesWithOnchainData = _tokensInstances.map( async (tokenInstance, index) => {
              const userBalance = onchainData[index]?.result; // Token User balance
              if (_resultOnly) {
                return { balance: userBalance };
              }
              const tokenInstanceUserDataArray:TTokenInstanceUserData[] = tokenInstance.userData;
              if (_address /* && typeof _from == 'string' */) {
                tokenInstanceUserDataArray[_address as any] = ({
                  ...tokenInstanceUserDataArray[_address as any],
                  balance: userBalance,
                }) // as TTokenInstanceUserData)
              } // if (_from && typeof _from == 'string')
              return {
                ...tokenInstance,
                status: step,
                userData: tokenInstanceUserDataArray,
              } // as TTokenInstance;

            }); // _tokensInstances.map
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          } // if (onchainData?.length > 0
        } // if (_tokensInstances && _tokensInstances.length)
      } catch (error) {
        console.error(`StepsContainer.tsx loadTokensOnChainData_addressBalances error: ${error}`);
      }
    } // loadTokensOnChainData_addressBalances
    ,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ); // loadTokensOnChainData_addressBalances callback

  // ---

  /**
   * Fetches token onchain data for:
   * - tokens transferability from one address to another
   * requires tokensInstances to be initialized with tokenInstance.contract
   */
  const loadTokensOnChainData_TransferAbility = useCallback(
    async(  _tokensInstances: TTokensInstances, _resultOnly:boolean,
            _source:TAddressEmptyNullUndef, _target:TAddressEmptyNullUndef): Promise<TTokensInstances> =>
    {
      try {
        if (_tokensInstances && _tokensInstances.length) {
          const secondaryAddress = (_target?_target:_source)
          // console.debug(`StepsContainer.tsx loadTokensOnChainData_TransferAbility: GET TOKENS TRANSFER FROM:${(_source?_source.substring(0,6)+"..."+_source.substring(_source.length-5,_source.length):"null/undef")} TO:${(secondaryAddress?secondaryAddress.substring(0,6)+"..."+secondaryAddress.substring(secondaryAddress.length-5,secondaryAddress.length):"null/undef")}`)
          const multicallArray = _tokensInstances.map( async (token) => {
            if (token?.contract) {
              if (token?.type == "COINBRIDGE" as TTokenType) {
                const amount = token.userData && token.userData[secondaryAddress as any]?.balance || 1 // set minimal amount for checking transferability. Ideally should be called after acount balance is retrieved
                // QUERY: From address, To address , Amount uint256 ;  RESPONSE: bool, uint256, uint256
                return {
                  ...token.contract,
                  functionName: 'canTransfer',
                  args: [_source, secondaryAddress, amount], // if no target: self transfer test
                }
              }
              // Anything else than COINBRIDGE
              // don't call contract, just provide return value assuming (transferability is) true
              return {
                  value: [true],
                }
            } // if (token?.contract)
            return null;
          });
          const multicallData = await Promise.all(multicallArray);
          const onchainData = await fetchOnChainDataWrapper(multicallData); // Multicall
          if (onchainData?.length > 0) {
            const tokensInstancesWithOnchainData = _tokensInstances.map( async (tokenInstance, index) => {
              const canTransfer = (onchainData[index] && onchainData[index]?.result && onchainData[index]?.result[0] ? true : false) ; // can transfer from to // result: bool, uint256, uint256
              if (_resultOnly) {
                return { canTransfer };
              }
              let tokenInstanceUserDataArray:TTokenInstanceUserData[] = tokenInstance.userData;
              if (!tokenInstanceUserDataArray) tokenInstanceUserDataArray = new Array<TTokenInstanceUserData>();
              tokenInstanceUserDataArray[secondaryAddress as any] = ({...tokenInstance.userData[secondaryAddress as any], canTransfer })
              return {
                ...tokenInstance,
                userData: tokenInstanceUserDataArray,
                status: step,
              } //as TTokenInstance;
            }); // _tokensInstances.map
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          } // if (onchainData?.length > 0
        } // if (_tokensInstances && _tokensInstances.length)
      } catch (error) {
        console.error(`StepsContainer.tsx loadTokensOnChainData_TransferAbility error: ${error}`);
      }
    } // loadTokensOnChainData_TransferAbility
    ,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ); // loadTokensOnChainData_TransferAbility callback

  // ---

    /**
   * Fetches token onchain data for:
   * - tokens decimals
   * requires tokensInstances to be initialized with tokenInstance.contract
   */
  const loadTokensOnChainData_decimals = useCallback(
    async(_tokensInstances: TTokensInstances, _resultOnly:boolean): Promise<TTokensInstances> =>
    {
      try {
        // console.debug(`StepsContainer.tsx loadTokensOnChainData_sourceBalances: GET TOKENS DECIMALS`)
        if (_tokensInstances && _tokensInstances.length) {
          const multicallArray = _tokensInstances.map( async (token) => {
            if (token?.contract) {
              return {
                ...token.contract,
                functionName: 'decimals',
              }
            } // if (token?.contract)
            return null;
          });
          const multicallData = await Promise.all(multicallArray);
          const onchainData = await fetchOnChainDataWrapper(multicallData); // Multicall
          if (onchainData?.length > 0) {
            const tokensInstancesWithOnchainData = _tokensInstances.map( async (tokenInstance, index) => {
              if (_resultOnly) {
                return {
                  decimals: onchainData[index]?.result, // Token decimals
                };
              }
              return {
                ...tokenInstance,
                decimals: onchainData[index]?.result, // Token decimals
                status: step,
              } as TTokenInstance;

            }); // _tokensInstances.map
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          } // if (onchainData?.length > 0
        } // if (_tokensInstances && _tokensInstances.length)
      } catch (error) {
        console.error(`StepsContainer.tsx loadTokensOnChainData_decimals error: ${error}`);
      }
    } // loadTokensOnChainData_decimals
    ,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ); // loadTokensOnChainData_decimals callback

  // ---

  /**
   * Fetches token onchain data for:
   * - tokens names
   * requires tokensInstances to be initialized with tokenInstance.contract
   */
  const loadTokensOnChainData_names = useCallback(
    async(_tokensInstances: TTokensInstances, _resultOnly:boolean): Promise<TTokensInstances> =>
    {
      try {
        // console.debug(`StepsContainer.tsx loadTokensOnChainData_names: GET TOKENS NAMES`)
        if (_tokensInstances && _tokensInstances.length) {
          const multicallArray = _tokensInstances.map( async (token) => {
            if (token?.contract) {
              return {
                ...token.contract,
                functionName: 'name',
              }
            }
            return null;
          });
          const multicallData = await Promise.all(multicallArray);
          const onchainData = await fetchOnChainDataWrapper(multicallData); // Multicall
          if (onchainData?.length > 0) {
            const tokensInstancesWithOnchainData = _tokensInstances.map( async (tokenInstance, index) => {
              if (_resultOnly) {
                return {
                  name: onchainData[index]?.result, // Token name
                };
              }
              return {
                ...tokenInstance,
                name: onchainData[index]?.result, // Token name
                status: step,
              } // as TTokenInstance;
            }); // _tokensInstances.map
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          } // if (onchainData?.length > 0
        } // if (_tokensInstances && _tokensInstances.length)
      } catch (error) {
        console.error(`StepsContainer.tsx loadTokensOnChainData_names error: ${error}`);
      }
    } // loadTokensOnChainData_names
    ,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ); // loadTokensOnChainData_names callback

  // ---

  /**
   * Fetches token onchain data for:
   * - tokens symbols
   * requires tokensInstances to be initialized with tokenInstance.contract
   */
  const loadTokensOnChainData_symbols = useCallback(
    async(_tokensInstances: TTokensInstances, _resultOnly:boolean): Promise<TTokensInstances> =>
    {
      try {
        // console.debug(`StepsContainer.tsx loadTokensOnChainData_symbols: GET TOKENS SYMBOLS`)
        if (_tokensInstances && _tokensInstances.length) {
          const multicallArray = _tokensInstances.map( async (token) => {
            if (token?.contract) {
              return {
                ...token.contract,
                functionName: 'symbol',
              }
            }
            return null;
          });
          const multicallData = await Promise.all(multicallArray);
          const onchainData = await fetchOnChainDataWrapper(multicallData); // Multicall
          if (onchainData?.length > 0) {
            const tokensInstancesWithOnchainData = _tokensInstances.map( async (tokenInstance, index) => {
              if (_resultOnly) {
                return {
                  symbol: onchainData[index]?.result, // Token symbol
                };
              }
              return {
                ...tokenInstance,
                symbol: onchainData[index]?.result, // Token symbol
                status: step,
              } // as TTokenInstance;
            }); // _tokensInstances.map
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          } // if (onchainData?.length > 0
        } // if (_tokensInstances && _tokensInstances.length)
      } catch (error) {
        console.error(`StepsContainer.tsx loadTokensOnChainData_symbols error: ${error}`);
      }
    } // loadTokensOnChainData_symbols
    ,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ); // loadTokensOnChainData_symbols callback

 // ---

  /**
   * Groups onchain data fetches
   * as well as contract instances initialization
   */
  const loadTokensOnChainData = useCallback( async(
    _tokensInstances: TTokensInstances, step:number,
    _from:TAddressEmptyNullUndef, _to:TAddressEmptyNullUndef, _resultOnly:boolean
    ): Promise<TTokensInstances> =>
    {
      try {
        if (_tokensInstances && _tokensInstances.length) {
          switch (step) {
            // Step contracts: get tokens contracts
            case EStepsLoadTokensData.contracts:
              return await loadTokensContracts(_tokensInstances)
            // Step sourceBalances: get tokens source user balances
            case EStepsLoadTokensData.sourceBalances:
              return loadTokensOnChainData_addressBalances(_tokensInstances, _resultOnly, _from);
            // Step sourceTransferAbility: get canTransfer token from source address
            case EStepsLoadTokensData.sourceTransferAbility:
              return loadTokensOnChainData_TransferAbility(_tokensInstances, _resultOnly, _from, _from);
            // Step decimals: get token decimals
            case EStepsLoadTokensData.decimals:
              return loadTokensOnChainData_decimals(_tokensInstances, _resultOnly);
            // Step names: get token name
            case EStepsLoadTokensData.names:
              return loadTokensOnChainData_names(_tokensInstances, _resultOnly);
            // Step symbols: get token symbol
            case EStepsLoadTokensData.symbols:
              return loadTokensOnChainData_symbols(_tokensInstances, _resultOnly);
            // Step targetBalances: get tokens target user balances
            case EStepsLoadTokensData.targetBalances:
              return loadTokensOnChainData_addressBalances(_tokensInstances, _resultOnly, _to);
            // Step targetTransferAbility: get canTransfer token from source address to target  address
            case EStepsLoadTokensData.targetTransferAbility:
              return loadTokensOnChainData_TransferAbility(_tokensInstances, _resultOnly, /* _from */_to, _to);
            // Step ??: Watch transfers : TODO
            default:
              console.warn(`StepsContainer.tsx loadTokensOnChainData error: step=${step} not found`)
              return _tokensInstances;
          } // switch (step)
        } // if (tokens?.length > 0)
      } // try
      catch (error) {
        console.error(`loadTokensOnChainData error: ${error}`);
      } // catch (error)
    },
    [ loadTokensContracts, loadTokensOnChainData_addressBalances, loadTokensOnChainData_TransferAbility,
      loadTokensOnChainData_decimals, loadTokensOnChainData_names, loadTokensOnChainData_symbols ]
  ); // loadTokensOnChainData

  // ---

  const resetToInitialStepCB = useCallback( () =>
    {
      resetToInitialStep()
    },
    [resetToInitialStep]
  ) // resetToInitialStep

  // ----------------------------------------------


  // USE EFFECTS

  /**
   * Reset to initial step when chainId or connectedAddress changes
   */
  useEffect( () =>
    {
      try {
        // console.log(`Switching to chainId=${chainId} connectedAddress=${connectedAddress}`)
        resetToInitialStepCB()
        settokensInstances(null)
      } catch (error) {
        console.error(`StepsContainer.tsx useEffect [chainId, connectedAddress, resetToInitialStepCB] error: ${error}`);  
      }
    },
    [chainId, connectedAddress, resetToInitialStepCB]
  ) // useEffect

  // ---

  useEffect( () =>
    {

      const loadTargetData = async( _tokensInstances:TTokensInstances, targetAddress:TAddressEmpty) : Promise<TTokenInstance[]> =>
      {
        let tokensInstancesData:TTokenInstance[] = []
        try {
          if (_tokensInstances && targetAddress) {
            // Load target balances
            // tokens target user balances
            const targetBalances = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.targetBalances, null, targetAddress, true);
            // tokens transfer ability
            const canTransfer = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.targetTransferAbility, null,targetAddress, true);
            // Wait for all promises to resolve
            const loadTokensOnChainDataPromises = await Promise.all([targetBalances, canTransfer]);
            // Merge loadTokensOnChainDataPromises results
            tokensInstancesData = _tokensInstances?.map( (_tokenInstance:TTokenInstance, index:number) => {
              if (loadTokensOnChainDataPromises && loadTokensOnChainDataPromises[0] && loadTokensOnChainDataPromises[1] ) {
                _tokenInstance.userData[targetAddress as any] = {
                  ..._tokenInstance.userData[targetAddress as any],
                  ...loadTokensOnChainDataPromises[0][index], // target balances
                  ...loadTokensOnChainDataPromises[1][index], // can transfer
                }
              } // if (loadTokensOnChainDataPromises && loadTokensOnChainDataPromises[0] && loadTokensOnChainDataPromises[1] )
              return _tokenInstance;
            })

          } // if (_tokensInstances && targetAddress)
        } catch (error) {
          console.error(`StepsContainer.tsx loadTargetData error: ${error}`);
        }
        return tokensInstancesData;
      } // loadTargetData

      /**
       * 
       * @param chainTokensList
       * on chain data loading must be done in order
       * @returns Promise<TTokensInstances>
       */
      const getUpdatedChainTokensListTokensInstances = async( chainTokensList:TChainsTokensListNullUndef ) : Promise<TTokensInstances> =>
      {
        const start:number = Date.now()
        try {
          // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances chainTokensList.chainId=${chainTokensList?.chainId} chainTokensList.tokensCount=${chainTokensList?.tokensCount} chainTokensList.tokensInstances?.length=${chainTokensList?.tokensInstances?.length}`)
          let _tokensInstances:TTokensInstances;
          if (chainTokensList && chainTokensList.tokensInstances && chainTokensList.tokensInstances.length) {
            // let tmp: TTokensInstances = []
            _tokensInstances = chainTokensList.tokensInstances;
            // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances _tokensInstances =`)
            // console.dir(_tokensInstances)

            if (chainTokensList.loadState == EChainTokensListLoadState.notLoaded) {
              // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EStepsLoadTokensData == NOTLOADED`)
              // Load contracts
              _tokensInstances = await loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.contracts, null, null, true)
              chainTokensList.loadState = EChainTokensListLoadState.contracts // EChainTokensListLoadState.contracts
              // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EStepsLoadTokensData.contracts _tokensInstances =`)
              // console.dir(_tokensInstances)
            }

            if (chainTokensList.loadState == EChainTokensListLoadState.contracts) {
              // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances chainTokensList.loadState == EChainTokensListLoadState.CONTRACTS`)
              // Load everything else : sourceBalances, decimals, names, symbols
              // tokens names
              const tokensNamesPromises = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.names, null, null, true)

              // tokens connected user (source) balances
              const tokensSourceBalancesPromises = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.sourceBalances, connectedAddress, null, true)

              // tokens source transferability
              const tokensSourceCanTransferPromises = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.sourceTransferAbility, connectedAddress, connectedAddress, true);

              // tokens decimals
              const tokensDecimalsPromises = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.decimals, null, null, true)
              // tokens symbols
              const tokensSymbolsPromises = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.symbols, null, null, true)

              // If targetAddress is already set, load Additionnal data: targetBalances, transferAbility
              // tokens target user balances
              const tokensTargetBalancesPromises = targetAddress ? loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.targetBalances, null, targetAddress, true) : null ;
              // tokens target transferability
              // const tokensTargetCanTransferToPromises = targetAddress ? loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.targetTransferAbility,true,connectedAddress,targetAddress, true) : null ;
              const tokensTargetCanTransferToPromises = targetAddress ? loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.targetTransferAbility, null, targetAddress, true) : null ;

              // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances BEFORE Promise.all`)

              // Wait for all promises to resolve
              // const loadTokensOnChainDataPromises = targetAddress ? await Promise.all([names, sourceBalances, decimals, symbols, targetBalances, canTransferToTarget]) : await Promise.all([names, sourceBalances, decimals, symbols]) ;
              // const loadTokensOnChainDataPromises = await Promise.all( [tokensNamesPromises, tokensSourceBalancesPromises, tokensDecimalsPromises, tokensSymbolsPromises]) ;
              const [tokensNames, tokensSourceBalances, tokensSourceCanTransfer, tokensDecimals, tokensSymbols, tokensTargetBalances, tokensTargetCanTransferTo ] =
                targetAddress ?
                  await Promise.all( [tokensNamesPromises, tokensSourceBalancesPromises, tokensSourceCanTransferPromises, tokensDecimalsPromises, tokensSymbolsPromises]) :
                  await Promise.all( [tokensNamesPromises, tokensSourceBalancesPromises, tokensSourceCanTransferPromises, tokensDecimalsPromises, tokensSymbolsPromises, tokensTargetBalancesPromises, tokensTargetCanTransferToPromises ]) ;

              // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances AFTER Promise.all`)

              // Merge loadTokensOnChainDataPromises results
              const tokensInstancesAllData = _tokensInstances?.map( (_tokenInstance:TTokenInstance, index:number) => {
                // Update tokenInstance with data from promises
                if (tokensNames && tokensSourceBalances && tokensSourceCanTransfer && tokensDecimals && tokensSymbols ) {
                    _tokenInstance.name = tokensNames[index].name // tokens names
                    const {balance} = tokensSourceBalances[index] as unknown as TTokenInstanceUserData
                    _tokenInstance.userData[connectedAddress as any] = {..._tokenInstance.userData[connectedAddress as any], /* ...tokensSourceBalances[index] */balance, ...tokensSourceCanTransfer[index]} // source balances, can transfer from source
                    _tokenInstance.decimals = tokensDecimals[index].decimals // tokens decimals
                    _tokenInstance.symbol = tokensSymbols[index].symbol // tokens symbols
// console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances fetch data : SET TRANSFER AMOUNT TO BALANCE ${balance||0n}`)
//                     _tokenInstance.transferAmount = balance||0n // tokens transfer amount
                    // TODO : CHECK IT IS WORKING
                    // TODO : CHECK IT IS WORKING
                    // TODO : CHECK IT IS WORKING
                    if (targetAddress && tokensTargetBalances && tokensTargetCanTransferTo) {
                      // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances targetAddress IS SET targetAddress && tokensTargetBalances && tokensTargetCanTransferTo MERGING promises`)
                      _tokenInstance.userData[targetAddress as any] = {..._tokenInstance.userData[targetAddress as any], ...tokensTargetBalances[index], ...tokensTargetCanTransferTo[index]} // target balances, can transfer to target
                  } // if (tokensTargetBalances && tokensTargetCanTransferTo)

                }
                return _tokenInstance;
              }) // map

              // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances AFTER MERGE promises (names, user balances, decimals, symbols, [target balances, cantransfer]) tokensInstancesAllData =`)
              // console.dir(tokensInstancesAllData)

              // update chainTokensList
              chainTokensList.tokensInstances = tokensInstancesAllData;
              if (!targetAddress) {
                // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances (names, user balances, decimals, symbols) targetAddress is NOT SET`)
                // Everything up to symbols included is loaded
                chainTokensList.loadState = EChainTokensListLoadState.symbols
              } else {
                // Everything up to transferAbility included is loaded
                // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances (names, user balances, decimals, symbols, target balances, cantransfer) targetAddress IS SET`)
                
                chainTokensList.loadState = EChainTokensListLoadState.targetTransferAbility
              }

            } // if (chainTokensList.loadState == EChainTokensListLoadState.contracts)
            else {
              // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState. <> CONTRACTS`)
              // Contracts, names, sourceBalances, decimals, symbols already loaded

              // Check if targetAddress is set
              // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
              // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
              // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
              // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE

              // TODO: CLEAR SELECTED TOKENS
              // TODO: CLEAR SELECTED TOKENS
              // TODO: CLEAR SELECTED TOKENS
              // TODO: CLEAR SELECTED TOKENS
              // TODO: CLEAR SELECTED TOKENS
              // TODO: CLEAR SELECTED TOKENS
              // TODO: CLEAR SELECTED TOKENS
              // TODO: CLEAR SELECTED TOKENS

              if (targetAddress) {

                // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState. <> CONTRACTS targetAddress is set`)

                // Load State : Symbol = load targetBalances, transferAbility
                if (chainTokensList.loadState == EChainTokensListLoadState.symbols) {
                  // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState == SYMBOLS targetAddress is set`)
                  // Load target data

                  const _tokensInstancesTargetData = await loadTargetData(_tokensInstances, targetAddress)
                  if (_tokensInstancesTargetData && _tokensInstancesTargetData.length ) {
                    _tokensInstances = _tokensInstancesTargetData
                  }

                  // // tokens target user balances
                  // const targetBalances = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetBalances,true,"", targetAddress, true);
                  // // tokens transfer ability
                  // const canTransfer = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.transferAbility,true,connectedAddress,targetAddress, true);

                  // // Wait for all promises to resolve
                  // const loadTokensOnChainDataPromises = await Promise.all([targetBalances, canTransfer]);

                  // // Merge loadTokensOnChainDataPromises results
                  // const tokensInstancesAllData = _tokensInstances?.map( (_tokenInstance:TTokenInstance, index:number) => {
                  //   if (loadTokensOnChainDataPromises && loadTokensOnChainDataPromises[0] && loadTokensOnChainDataPromises[1] ) {
                  //     _tokenInstance.userData = {
                  //       ..._tokenInstance.userData,
                  //       ...loadTokensOnChainDataPromises[0][index].userData, // target balances
                  //       ...loadTokensOnChainDataPromises[1][index].userData, // can transfer
                  //     }
                  //   }
                  //   return _tokenInstance;
                  // })

                  // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances AFTER MERGE promises (target balances, cantransfer) _tokensInstancesTargetData =`)
                  // console.dir(_tokensInstancesTargetData)

                  // update chainTokensList
                  chainTokensList.tokensInstances = _tokensInstancesTargetData;
                  // Everything up to targetTransferAbility included is loaded
                  chainTokensList.loadState = EChainTokensListLoadState.targetTransferAbility

                } // if (chainTokensList.loadState == EChainTokensListLoadState.symbols)
                else {
                  // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState <> SYMBOLS targetAddress is set`)
                  // Check targetAddress for missing data
                  const allInstancesWithTargetData = _tokensInstances?.every( (_tokenInstance:TTokenInstance) => {
                    return ( _tokenInstance.userData && _tokenInstance.userData[targetAddress as any] &&
                      !(_tokenInstance.userData[targetAddress as any].balance == undefined || _tokenInstance.userData[targetAddress as any].balance == null
                      || _tokenInstance.userData[targetAddress as any].canTransfer == undefined || _tokenInstance.userData[targetAddress as any].canTransfer == null)
                    )
                  })

                  if (!allInstancesWithTargetData) {
                    // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState <> SYMBOLS ; targetAddress is set ; NOT ALLINSTANCESWITHTARGET LOADING TARGET DATA`)
                    const _tokensInstancesTargetData = await loadTargetData(_tokensInstances, targetAddress)
                    // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances AFTER loadTargetData _tokensInstancesTargetData =`)
                    // console.dir(_tokensInstancesTargetData)
                    if (_tokensInstancesTargetData && _tokensInstancesTargetData.length ) {
                      _tokensInstances = _tokensInstancesTargetData
                    }

                    // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances AFTER MERGE promises (target balances, cantransfer) _tokensInstancesTargetData =`)
                    // console.dir(_tokensInstancesTargetData)

                    // update chainTokensList
                    chainTokensList.tokensInstances = _tokensInstancesTargetData;
                    // Everything up to targetTransferAbility included is loaded
                    chainTokensList.loadState = EChainTokensListLoadState.targetTransferAbility
                  }
                  else {
                    // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState <> SYMBOLS ; targetAddress is set ; ALLINSTANCESWITHTARGET EVERYTHING IS LOADED`)
                  }

                  // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                  // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                  // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                  // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                  // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances chainTokensList.loadState=${chainTokensList.loadState} TARGETADDRESS is set, NOTHING TO DO`)
                }
                // // Load State : targetBalances = load transferAbility
                // if (chainTokensList.loadState == EChainTokensListLoadState.targetBalances) {
                //   // Load transfer ability
                //   _tokensInstances = await loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.transferAbility,true,connectedAddress,targetAddress, true)
                //   chainTokensList.loadState = EChainTokensListLoadState.transferAbility

                // }

              } // if (targetAddress)
              else {
                // console.info(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances chainTokensList.loadState=${chainTokensList.loadState} BUT TARGETADDRESS is NOT YET set, nothing to do`)
              }

            } // else

            // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances BEFORE RETURN chainTokensList.tokensInstances`)
            return chainTokensList.tokensInstances;
          } // if (chainTokensList && chainTokensList.tokensInstances && chainTokensList.tokensInstances.length)
          else {
            console.warn(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances chainTokensList is NULL/UNDEF`)
          }
          // return undefined;
        } catch (error) {
          console.error(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances error: ${error}`);
        }

        finally {
          // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances AFTER RETURN chainTokensList.tokensInstances elapsed=${Date.now() - start}ms`)
          console.log(`loading chaind ${chainTokensList?.chainId} tokens data took: ${Date.now() - start}ms`)
          
        }

      } // getUpdatedChainTokensListTokensInstances

      // ---

      const getUpdatedTokensInstancesArray = async (_chainsTokensList:TChainsTokensListArrayNullUndef):Promise<TTokensInstances[]/*  | undefined */> => {
        let result:TTokensInstances[] = []
        try {
          // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray`)
          if (_chainsTokensList && _chainsTokensList.length) {

            const tokenInstances = _chainsTokensList.map( async(chainTokensList:TChainsTokensListNullUndef) => {
              // console.dir(chainTokensList)
              const updatedChainTokensListTokensInstances = await getUpdatedChainTokensListTokensInstances(chainTokensList)
              // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray: getUpdatedChainTokensListTokensInstances t=`)
              // console.dir(t)
              // update
              // chainTokensList.tokensInstances = t
              const updatedChainTokensListTokensInstancesProps = updatedChainTokensListTokensInstances?.map( (tokenInstance:TTokenInstance) => {
                // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray: getUpdatedChainTokensListTokensInstances t=`)
                // console.dir(tokenInstance)
                // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray: getUpdatedChainTokensListTokensInstances t.userData=`)
                // console.dir(tokenInstance.userData)
                const selectable = (tokenInstance.userData
                  && (tokenInstance.userData[connectedAddress as any]?.balance || 0n > 0n)
                  && tokenInstance.userData[connectedAddress as any]?.canTransfer && tokenInstance.userData[targetAddress as any]?.canTransfer) ? true : false ;
                // tokenInstance.selectable = selectable;

                // const transferAmount = (selectable && !tokenInstance.transferAmount ? tokenInstance.userData[connectedAddress as any]?.balance || 0n : 0n)
                const transferAmount = (!selectable && tokenInstance.transferAmount>0n ? 0n : (tokenInstance.transferAmount?tokenInstance.transferAmount:tokenInstance.userData[connectedAddress as any]?.balance || 0n))

                const selected = (tokenInstance.selected && selectable) ? true : false ;

                const transferAmountLock = (selectable && tokenInstance.transferAmountLock) ? true : false ;

                return { ...tokenInstance,
                  selectable,
                  // transferAmount: 500n,
                  transferAmount,
                  selected,
                  transferAmountLock
                };
              }) // updatedChainTokensListTokensInstances?.map
              
              // if (chainTokensList) {
              //   chainTokensList.tokensInstances = updatedChainTokensListTokensInstancesProps
              // }
              // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray: updatedChainTokensListTokensInstancesProps=`)
              // console.dir(updatedChainTokensListTokensInstancesProps)
              return updatedChainTokensListTokensInstancesProps;
            })

            // if (tokenInstances && tokenInstances.length) {
              // const tokenInstancesArrayUpdated = await Promise.all(tokenInstances  as Promise<TTokensInstances>[])
              // result = tokenInstancesArrayUpdated; // RETURN
              result = await Promise.all(tokenInstances  as Promise<TTokensInstances>[])
              // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray: tokenInstances=`)
              // console.dir(result)
            // }
  
          } // if (_chainsTokensList && _chainsTokensList.length)
          // For each chain tokens list, get/update its tokens instances
        } catch (error) {
          console.error(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray error: ${error}`);
        }
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray result=`)
        // console.dir(result)
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray BEFORE RETURN`)
        return result
      } // getUpdatedTokensInstancesArray



      const updateChainTokensListTokensInstances = async (_chainsTokensList:TChainsTokensListArrayNullUndef):Promise<TChainsTokensListArrayNullUndef> => {
        // let chainsTokensListResult:TChainsTokensListArrayNullUndef // = [];
        try {
          // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances`)
          // chainsTokensListResult = _chainsTokensList;
          const updatedTokensInstancesArray = await getUpdatedTokensInstancesArray(_chainsTokensList)
          // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances: AFTER getUpdatedTokensInstancesArray`)
          // updatedTokensInstancesArray.then( (updatedTokensInstancesArray:TTokensInstances[]) => {
  
            if (updatedTokensInstancesArray && updatedTokensInstancesArray.length) {
              _chainsTokensList?.forEach( (_chainsTokensList:TChainsTokensListNullUndef, index) => {
                // Update each _chainsTokensList with updated tokensInstances
                if (_chainsTokensList && updatedTokensInstancesArray[index] ) {
                  // console.debug(`StepsContainer.tsx updateChainTokensListTokensInstances: updatedTokensInstancesArray[${index}]=`)
                  // console.dir(updatedTokensInstancesArray[index])
                  _chainsTokensList.tokensInstances = updatedTokensInstancesArray[index]
                }
              })
            } // if (_tokenInstancesArray)
            else {
              // console.warn(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: updatedTokensInstancesArray.length <= 00`)
            }
          // }) // updatedTokensInstancesArray.then

          // console.debug(`updateChainTokensListTokensInstances: updatedTokensInstancesArray =`)
          // console.dir(updatedTokensInstancesArray)

        } catch (error) {
          console.error(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances error: ${error}`);
        }
        // return chainsTokensListResult;
        // console.debug(`updateChainTokensListTokensInstances: _chainsTokensList =`)
        // console.dir(_chainsTokensList)
        return _chainsTokensList
      } // updateChainTokensListTokensInstances

      // ---

      const start:number = Date.now()
      try {
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]`)
        const newSelectedChainsTokensList:TChainsTokensListArrayNullUndef = [];
        // const tokensInstances:TTokensInstances = [];
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: tokensLists=${tokensLists} tokensLists?.length=${tokensLists?.length}`)
        const selectedTokenLists = getSelectedTokenLists(selectableTokensLists);
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: selectedTokenLists.length = ${selectedTokenLists?.length}, selectedTokenLists= `)
        // console.dir(selectedTokenLists)
        selectedTokenLists?.map( (selectedTokenList:TSelectableTokensList) => {
          // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: selectedTokenList=`)
          // console.dir(selectedTokenList)
          // Find selected tokensList in all tokensLists
          
          tokensLists?.forEach( (tokensList:TTokensList) => {
            // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: tokensList.id=${tokensList.id} (current) tokensList=`)
            // console.dir(tokensList)
            // debugger
            if (tokensList.id == selectedTokenList.tokensList.id) {
              // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: MATCH tokensList.id == selectedTokenList.tokensList.id  tokensList.id=${tokensList.id}`)
              const chainTokensList = getChainTokensList(tokensList, chainId) // TChainsTokensListNullUndef
              newSelectedChainsTokensList.push(chainTokensList)
            }
          }) // tokensLists?.forEach
          
        })
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: newSelectedChainsTokensList.length = ${newSelectedChainsTokensList?.length}, newSelectedChainsTokensList[]=`)
        // console.dir(newSelectedChainsTokensList)

        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: newSelectedChainsTokensList to TTokenChainDataArray`)
        if (newSelectedChainsTokensList.length > 0) {

          // setLoadingDataState(true)
          // setisLoading(true)
          setStateLoadingTokensInstances(true)
          setStateIsFetchingData(true)
          // debugger;
          setStateErrorLoadingTokensInstances(false)

          // let tokensCount = 0
          newSelectedChainsTokensList.forEach( (selected_chainTokensList:TChainsTokensListNullUndef) => {
            if (selected_chainTokensList) {
              // Assume chain tokens count <> chain tokens instances count means tokens instances are not initialized
              if (selected_chainTokensList.tokensCount != selected_chainTokensList.tokensInstances?.length) {
                // Init tokensInstances
                // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: (RE)INIT selected_chainTokensList.tokensInstances selected_chainTokensList.tokensCount=${selected_chainTokensList.tokensCount} selected_chainTokensList.tokensInstances?.length=${selected_chainTokensList.tokensInstances?.length}`)
                const selected_chainTokensList_tokensInstances:TTokensInstances = [];
                // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: selected_chainTokensList.chainId=${selected_chainTokensList.chainId} selected_chainTokensList.tokensCount=${selected_chainTokensList.tokensCount}`)
                selected_chainTokensList.tokens?.forEach( (token:TTokenChainData, index) => {
                  const _tokenInstance = initTokenInstance(token, index+1)
                  // console.dir(_tokenInstance)
                  if (_tokenInstance) selected_chainTokensList_tokensInstances.push(_tokenInstance);
                })

                // Update selected ChainsTokensList tokensInstances
                selected_chainTokensList.tokensInstances = selected_chainTokensList_tokensInstances;
                // _selectedChainsTokensList.push(selected_chainTokensList)
                
              } // if (selected_chainTokensList.tokensCount != selected_chainTokensList.tokensInstances?.length)
              else {
                // Tokens instances already initialized
                // TODO: check if tokensInstances are up to date : remove user data if user changed account
                // TODO: check if tokensInstances are up to date : remove user data if user changed account
                // TODO: check if tokensInstances are up to date : remove user data if user changed account
                // TODO: check if tokensInstances are up to date : remove user data if user changed account
                // TODO: check if tokensInstances are up to date : remove user data if user changed account
                // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: selected_chainTokensList.tokensInstances ALREADY INITIALIZED selected_chainTokensList.tokensCount=${selected_chainTokensList.tokensCount} selected_chainTokensList.tokensInstances?.length=${selected_chainTokensList.tokensInstances?.length}`)

              }
              // tokensInstances.push(...selected_chainTokensList.tokensInstances)
              
            } // if (selected_chainTokensList && selected_chainTokensList.tokensCount != selected_chainTokensList.tokensInstances?.length)

          }) // newSelectedChainsTokensList.forEach
          // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: newSelectedChainsTokensList.length=${newSelectedChainsTokensList.length} newSelectedChainsTokensList[]=`)
          // console.dir(newSelectedChainsTokensList)

          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // setselectedChainsTokensList(newSelectedChainsTokensList);

          updateChainTokensListTokensInstances(newSelectedChainsTokensList).then( (updatedChainsTokensList:TChainsTokensListArrayNullUndef) => {
            // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] AFTER updateChainTokensListTokensInstances.then`)
            // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: SET SelectedChainsTokensList`)
            setselectedChainsTokensList(updatedChainsTokensList)
            setStateLoadingTokensInstances(false)
            setStateIsFetchingData(false)
            // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances elapsed=${Date.now() - start}ms`)
            // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances elapsed=${Date.now() - start}ms`)
          }).catch( (error) => {
            console.error(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances error: ${error}`);
            setStateLoadingTokensInstances(false)
            setStateErrorLoadingTokensInstances(true)
            setStateIsFetchingData(false)
          })

        } // if (newSelectedChainsTokensList.length > 0)
        // else {
        //   // settokensInstances(null)
        //   console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: newSelectedChainsTokensList.length <= 00`)
        // }
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: SET SelectedChainsTokensList`)
        // setselectedChainsTokensList(newSelectedChainsTokensList)
        // console.dir(newSelectedChainsTokensList)
      } catch (error) {
        console.error(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: error=${error}`)
      }
      finally {
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances elapsed=${Date.now() - start}ms`)
        console.log(`loading all selected chains tokens data took: ${Date.now() - start}ms`)
      }
    },
    [tokensLists, selectableTokensLists,
      chainId, targetAddress, connectedAddress,
      getSelectedTokenLists, initTokenInstance, loadTokensOnChainData,
      setStateLoadingTokensInstances, setStateErrorLoadingTokensInstances,
      setStateIsFetchingData]
  ) // useEffect

  // ---

  /**
   * useEffect: update tokens instances
   * triggered by selectedChainsTokensList update
   */

  useEffect( () =>
    {
      const tokensInstancesFromSelectedTokensLists: TTokensInstances = []
      if (selectedChainsTokensList && selectedChainsTokensList.length) {
        selectedChainsTokensList.forEach( (selectedChainsTokensList:TChainsTokensListNullUndef) => {
          if (selectedChainsTokensList && selectedChainsTokensList.tokensInstances && selectedChainsTokensList.tokensInstances.length) {
            tokensInstancesFromSelectedTokensLists.push(...selectedChainsTokensList.tokensInstances)
            }
          })
        settokensInstances(tokensInstancesFromSelectedTokensLists)
      }
    },
    [selectedChainsTokensList]
  ) // useEffect [selectedChainsTokensList]


  // ---

  const initSelectableTokensLists = useCallback( async() =>
    {

      try {
        const filteredSelectableTokensLists: TSelectableTokensLists = []
        tokensLists?.forEach( (tokensList: TTokensList) => {
          const chainTokensList = getChainTokensList(tokensList, chainId)
          const currentChainTokensCount = (chainTokensList?chainTokensList.tokensCount:0)
          const selectable = (currentChainTokensCount > 0) && (tokensList.status == "ok")
          const selectableTokensList = {
            tokensList,
            chainId,
            selected: false,
            selectable,
            currentChainTokensCount
          }
          filteredSelectableTokensLists.push(selectableTokensList)
        })
        setselectableTokensLists(filteredSelectableTokensLists)
      } catch (error) {
        console.error(`TokensListsSelect.tsx: initSelectableTokensLists: error=${error}`);
      }

    },
    [chainId, setselectableTokensLists, tokensLists]
  );

  // ---

  useEffect( () =>
    {
      try {
      initSelectableTokensLists()
      } catch (error) {
        console.error(`StepsContainer.tsx useEffect [INIT SELECTABLE TOKENSLISTS] error: ${error}`);
      }
    },
    [initSelectableTokensLists]
  )

  // ---------------------------------------------------

  return (
    <>

      { (step < 0 || step > 3) &&
        <div className=" w-full bg-error text-error-content" >
          <MainContentContainer>
              <StepError setpreviousDisabled={setpreviousDisabled} setNextDisabled={setNextDisabled} />
          </MainContentContainer>
        </div>
      }

      { 
        step === 0 &&
        <div className="w-full" >
                
          <MainContentContainer>
            <Step0
              setNextDisabled={setNextDisabled}
              selectableTokensLists={selectableTokensLists}
              setselectableTokensLists={setselectableTokensLists}
              accountAddress={connectedAddress}
              targetAddress={targetAddress}
              tokensInstances={tokensInstances}
              chainId={chainId}
              isLoadingTokensLists={isLoadingTokensLists}
              isErrorTokensLists={isErrorTokensLists}
              isLoadingTokensInstances={isLoadingTokensInstances}
              isErrorTokensInstances={isErrorTokensInstances}

              tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
            />
          </MainContentContainer>

        </div>
      }

      { step === 1 &&
        <div className="w-full" >
          <MainContentContainer>
            <Step1
              setNextDisabled={setNextDisabled}
              accountAddress={connectedAddress}
              tokensInstances={tokensInstances}
              chainId={chainId}
              targetAddress={targetAddress}
              settargetAddress={settargetAddress}
              isLoadingTokensInstances={isLoadingTokensInstances} isErrorTokensInstances={isErrorTokensInstances}
              tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
            />
          </MainContentContainer>
        </div>
      }

      { step === 2 &&
        <div className="w-full" >
          <MainContentContainer>
              <Step2
              setNextDisabled={setNextDisabled}
              tokensInstances={tokensInstances}
              setShowProgressBar={setShowProgressBar}
              accountAddress={connectedAddress}
              targetAddress={targetAddress}
              isLoadingTokensInstances={isLoadingTokensInstances} isErrorTokensInstances={isErrorTokensInstances}
              tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
                />
          </MainContentContainer>
        </div>
      }

      { step === 3 &&
        <div className="w-full px-1" >
          <MainContentContainer>
            <Step3
              chainId={chainId}
              setNextDisabled={setNextDisabled}
              tokensInstances={tokensInstances}
              setShowProgressBar={setShowProgressBar}
              accountAddress={connectedAddress}
              targetAddress={targetAddress}
              tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
              setmigrationState={setmigrationState}
            />
          </MainContentContainer>
        </div>
      }

    </>
  );
}

// ------------------------------

export default StepsContainer;