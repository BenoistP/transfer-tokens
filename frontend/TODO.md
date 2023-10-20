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
- Load tokens data in parallel
- Move tokens lists to app context ?

🚧 Transitions

🚧 Spinners
https://play.tailwindcss.com/OPAsySKNCd

🚧 Modals

☑️ Error handling
☑️ 🚧 Move tokens 🏠🏡
🗒 🚧 progressive list loading

Step 1: 🚧 
- Watch for balances changes 👀

Step 3: 🚧 
- ☑️ Fix list loading bug/missing icons (all/none & lock)
- Update transfer amount
- display target address
- 🚧 Sort tokens: ☑️ by Id  🚧 By Name  🚧 by Balance
- ☑️ fix tokens numbering in lists (filtering changes numbers)




🚧 avatar list/select style

Make an address component and properly check address validity
check destination address is a contract and show a warning


Bugs :
  🐜 refresh DESTINATION address list on address update


🚧 disclaimer

👀 https://www.rainbowkit.com/docs/authentication
👀 https://www.rainbowkit.com/docs/recent-transactions



🚧 Migration fixes:
🚧 - frontend/src/app/js/providers/MoveTokensAppProvider/MoveTokensAppContext.tsx
      Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
   - remove api keys