import jsonata from "jsonata"

/*
const realTJsonataTransform = `{
    "name": "RealT API (api.realt.community)",
    "logoURI": "https://yt3.googleusercontent.com/ytc/AOPolaQLI9Vbm8mEvFilGnLm0wcbiKNF6RQxkKXJt9n5=s176-c-k-c0x00ffffff-no-rj",
    "timestamp": $now(),
    "keywords": [
        "realT", "defi"
      ],
    
    "tokens": 
    
    [
    $map($, function($realtoken) {
     $realtoken.xDaiContract or $realtoken.gnosisContract ?
     (
      $realtoken {
        "name": $realtoken.shortName,
        "chainId": 100,
        "address": $realtoken.gnosisContract?$realtoken.gnosisContract:$realtoken.xDaiContract,
        "decimals": 18,
        "extensions": {
            "fullName": $realtoken.fullName,
            "shortName": $realtoken.shortName,
            "uuid": $realtoken.uuid,
            "tokenPrice": $realtoken.tokenPrice,
            "currency": $realtoken.currency
        }
      }
      )
        :  $realtoken.returnNoting
    })
    
    ,
     $map($, function($realtoken) {
     $realtoken.ethereumContract ?
     (
      $realtoken {
        "shortName": $realtoken.shortName,
        "chainId": 1,
        "address": $realtoken.ethereumContract,
        "decimals": 18,
           "extensions": {
            "fullName": $realtoken.fullName,
            "shortName": $realtoken.shortName,
            "uuid": $realtoken.uuid,
            "tokenPrice": $realtoken.tokenPrice,
            "currency": $realtoken.currency
           }
      }
      )
        :  $realtoken.returnNoting
    })
    ]
    
    }`
*/
  const realTJsonataTransformTokens = `[
    $map($, function($realtoken) {
     $realtoken.xDaiContract or $realtoken.gnosisContract ?
     (
      $realtoken {
        "name": $realtoken.shortName,
        "chainId": 100,
        "address": $realtoken.gnosisContract?$realtoken.gnosisContract:$realtoken.xDaiContract,
        "decimals": 18,
        "extensions": {
            "fullName": $realtoken.fullName,
            "shortName": $realtoken.shortName,
            "uuid": $realtoken.uuid,
            "tokenPrice": $realtoken.tokenPrice,
            "currency": $realtoken.currency,
            "lastUpdate": $realtoken.lastUpdate
        }
      }
      )
        :  $realtoken.returnNoting
    })
    
    ,
     $map($, function($realtoken) {
     $realtoken.ethereumContract ?
     (
      $realtoken {
        "shortName": $realtoken.shortName,
        "chainId": 1,
        "address": $realtoken.ethereumContract,
        "decimals": 18,
           "extensions": {
            "fullName": $realtoken.fullName,
            "shortName": $realtoken.shortName,
            "uuid": $realtoken.uuid,
            "tokenPrice": $realtoken.tokenPrice,
            "currency": $realtoken.currency,
            "lastUpdate": $realtoken.lastUpdate
           }
      }
      )
        :  $realtoken.returnNoting
    })
  ]`

const transformRealTApiJsonData = async (realTApiJsonData:any) => {
  try {
    const expression = jsonata(realTJsonataTransformTokens);
    const result = await expression.evaluate(realTApiJsonData);
    return result
  } catch (error) {
    console.error("transformRealTApiJsonDataData error", error);
  }
}
// ---

export {
  transformRealTApiJsonData
}