import { json } from "@remix-run/node";

import { transformRealTApiJsonData } from "~/utils/constants/jsonata";
import { getPublicEnv } from "~/ui/public-env";

export const loader = async () => {

  try {
    const uriRealTokensList = getUriRealTokensList()
    if (!uriRealTokensList) {
      // throw json("RealT API tokens list URL Not defined", { status: 500 });
      throw new Error("RealT API tokens list URL Not defined")
    }

    const defaultDate = new Date()
    const defaultLogoURI = "https://yt3.googleusercontent.com/ytc/AOPolaQLI9Vbm8mEvFilGnLm0wcbiKNF6RQxkKXJt9n5=s176-c-k-c0x00ffffff-no-rj"
    const defaultVersion = {
      major: 0,
      minor: 0,
      patch: 0
    }
    const defaultKeywords = [
      "realT", "DeFi", "Ethereum", "Gnosis chain", "xDai chain"
    ]

    const resRealTokensList = await fetch( uriRealTokensList )

    if (!resRealTokensList.ok) {
      // throw json(`RealT API tokens list URL Not found: ${uriRealTokensList}`, { status: 500 });
      throw new Error(`RealT API tokens list URL Not found: ${uriRealTokensList}`)
    }

    const realTApiJsonData = await resRealTokensList.json()
    const {timestamp: realTapiTimestamp, logoURI: realTapiLogoURI, version: realTapiVersion, keywords: realTapiKeywords} = realTApiJsonData
    const timestamp = (realTapiTimestamp?realTapiTimestamp:defaultDate.toISOString())
    const logoURI = (realTapiLogoURI?realTapiLogoURI:defaultLogoURI)
    const version = (realTapiVersion?realTapiVersion:defaultVersion)
    const keywords = (realTapiKeywords?realTapiKeywords:defaultKeywords)

    // throw new Error("TEST ERROR")
    // return json({ test: "ABCD" });

    const realTtokenList = {
      name: "RealT",
      description: "RealT API (api.realt.community) token list",
      logoURI,
      version,
      timestamp: timestamp,
      keywords,
      tokens: await transformRealTApiJsonData(realTApiJsonData)
    }
    return json(realTtokenList) // RETURN
  } catch (error) {
    console.error("loader error", error);
    return json({ error: (error instanceof Error) ? error.message:"" }, { status: 500 });
    // return json({ error: "ABCD" });
  }
};

// ------------------------------

const getUriRealTokensList = ():TTokenListUri => {
  try {
    let uriRealTokensList // undefined;
    if (getPublicEnv("PUBLIC_REALT_API_BASE_URL")) {
      console.log("getPublicEnv(PUBLIC_REALT_API_BASE_URL)", getPublicEnv("PUBLIC_REALT_API_BASE_URL"));
      if (getPublicEnv("PUBLIC_REALT_API_LIST_ALL_TOKENS")) {
        console.log("getPublicEnv(PUBLIC_REALT_API_LIST_ALL_TOKENS)", getPublicEnv("PUBLIC_REALT_API_LIST_ALL_TOKENS"));
        uriRealTokensList = `${getPublicEnv("PUBLIC_REALT_API_BASE_URL")}${getPublicEnv("PUBLIC_REALT_API_LIST_ALL_TOKENS")}`;
      } else {
        console.error("PUBLIC_REALT_API_LIST_ALL_TOKENS Not defined");
      }
    } else {
      console.error("PUBLIC_REALT_API_BASE_URL Not defined");
    }
    return uriRealTokensList // RETURN
  } catch (error) {
    console.error("getUriRealTokensList error", error);
  }
} // getUriRealTokensList
