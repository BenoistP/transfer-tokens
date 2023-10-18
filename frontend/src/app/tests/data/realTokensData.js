const REALTOKENS_JSON_TEST_DATA = [
  {
    "fullName": "OLD-9943 Marlowe St, Detroit, MI 48227",
    "shortName": "OLD-9943 Marlowe",
    "symbol": "REALTOKEN-9943-MARLOWE-ST-DETROIT-MI",
    "tokenPrice": 68.5,
    "currency": "USD",
    "uuid": "0xe5f7ef61443fc36ae040650aa585b0395aef77c8",
    "ethereumContract": "0xe5f7ef61443fc36ae040650aa585b0395aef77c8",
    "xDaiContract": null,
    "gnosisContract": null,
    "lastUpdate": {
      "date": "2023-07-26 12:40:23.000000",
      "timezone_type": 3,
      "timezone": "UTC"
    }
  },
  {
    "fullName": "4680 Buckingham Ave, Detroit, MI 48224",
    "shortName": "4680 Buckingham",
    "symbol": "REALTOKEN-S-4680-BUCKINGHAM-AVE-DETROIT-MI",
    "tokenPrice": 50.54,
    "currency": "USD",
    "uuid": "0xeFe82D6baF0dB71f92889eB9d00721bD49121316",
    "ethereumContract": "0xeFe82D6baF0dB71f92889eB9d00721bD49121316",
    "xDaiContract": "0xeFe82D6baF0dB71f92889eB9d00721bD49121316",
    "gnosisContract": "0xeFe82D6baF0dB71f92889eB9d00721bD49121316",
    "lastUpdate": {
      "date": "2023-07-26 12:40:24.000000",
      "timezone_type": 3,
      "timezone": "UTC"
    }
  },
  {
    "fullName": "D 9795-9797 Chenlot St, Detroit, MI 48204",
    "shortName": "D 9795-9797 Chenlot",
    "symbol": "REALTOKEN-D-9795-9797-CHENLOT-ST-DETROIT-MI",
    "tokenPrice": 50.75,
    "currency": "USD",
    "uuid": "0x75645f349DA40702710599ac41ADEF6e7e700DBE",
    "ethereumContract": null,
    "xDaiContract": "0x75645f349DA40702710599ac41ADEF6e7e700DBE",
    "gnosisContract": "0x75645f349DA40702710599ac41ADEF6e7e700DBE",
    "lastUpdate": {
      "date": "2023-07-26 12:40:32.000000",
      "timezone_type": 3,
      "timezone": "UTC"
    }
  },
]

export const REALTOKENS_TEST_DATA_OBJ = JSON.parse(JSON.stringify(REALTOKENS_JSON_TEST_DATA));
// console.dir(OBJTEST);