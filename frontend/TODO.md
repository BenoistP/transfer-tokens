☑️ check current chain id
☑️ fetch token addresses


☑️ Keys
- ☑️ WalletConnect
- ☑️ Alchemy
- ☑️ Infura



☑️ list wallet tokens


☑️ i18n
☑️ i18n switch

🚧 Toasts

☑️ Theme 🌗
☑️ Theme switch
☑️ Theme switch to finalize (multiple themes)
☑️ Theme colors: realOrange Theme
🚧 heroicon-stroke

☑️ Synchronize avatar in Rainbow wallet


Save tokens list in context
save tokens lists by chain id in context
use tokens lists in context to display tokens list in client


🚧 Enhancements
- ☑️ Load tokens data in parallel
- Move tokens lists to app context ?

🚧 Transitions

🚧 Spinners
https://play.tailwindcss.com/OPAsySKNCd

🚧 Modals

☑️ Error handling
☑️ 🚧 Move tokens 🏠🏡
🗒 🚧 progressive list loading


All Steps : 🚧 
- 🚧 Handle chain change



Step 0: 🚧
- ☑️ check transferability for connected account
- 🚧 Watch for balances changes 👀
- 𓆣 Ethereum data is not loaded ?
- 🚧 Add loading indicator when loading tokens lists

Step 2: 🚧 
- ☑️ Fix list loading bug/missing icons (all/none & lock)
- Update transfer amount
- display target address
- ☑️ Sort tokens: ☑️ by Id  ☑️ By Name  ☑️ by Balance
- ☑️ fix tokens numbering in lists (filtering changes numbers)
- ☑️ Unselect token on target address change (if not transferrable)
- 🚧 Keep transfer amount and lock state between screens



🚧 avatar list/select style

☑️ Make an address component and properly check address validity
🚧 check if destination address is a contract and show a warning


Bugs :
  🐜 refresh DESTINATION address list on address update


🚧 disclaimer

👀 https://www.rainbowkit.com/docs/authentication
👀 https://www.rainbowkit.com/docs/recent-transactions



🚧 Migration fixes:
🚧 - frontend/src/app/js/providers/MoveTokensAppProvider/MoveTokensAppContext.tsx
      Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
   - remove api keys