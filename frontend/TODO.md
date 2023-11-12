# TODO

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

🚧 Transitions

🚧 Modals

☑️ Error handling
☑️ 🚧 Move tokens 🏠🏡
☑️ progressive list loading

🚧 More languages

All Steps : 🚧

- ☑️ Handle chain change (back to step 0, remove checked token lists)

  - 🚧 reset target address or clear existing data on chain change
- ☑️ Set default language cookie (invisible flag)
- ☑️ Add fetch loading indicator in bottom bar
- ☑️ use filtered tokens table in all screens

filtered tokens table: 🚧

- ☑️ show target address balance
- ☑️ Add reset all filters
- ☑️ pre-Check "amount > 0" checkbox
- ☑️ Add colors to icons
- 🚧 Add Lock/unlock all
- ☑️ BUG: Error when input balance such as 0.1
- ☑️ BUG: On filter update: update selectAll/All visible checks

Step 0: 🚧

- ☑️ check transferability for connected account
- ☑️ Ethereum data is not loaded
- ☑️ Add loading indicator when loading tokens lists
- ☑️ Error handling
- 🚧 Watch for balances changes 👀

Step 1:

- ☑️ Error handling

Step 2:

- ☑️ Fix list loading bug/missing icons (all/none & lock)
- ☑️ Update transfer amount
- ☑️ display target address
- ☑️ Sort tokens: ☑️ by Id  ☑️ By Name  ☑️ by Balance
- ☑️ fix tokens numbering in lists (filtering changes numbers)
- ☑️ Unselect token on target address change (if not transferrable)
- ☑️ Keep transfer amount and lock state between screens
- ☑️ Error handling

Step 3:

- ☑️ display target address
- ☑️ Show amount, not balance
- 🚧 Show success toast on txhash

🚧 avatar list/select style

☑️ Make an address component and properly check address validity
🚧 check if destination address is a contract and show a warning

Bugs :
  🐜

🚧 disclaimer

👀 https://www.rainbowkit.com/docs/authentication
👀 https://www.rainbowkit.com/docs/recent-transactions

🚧 Migration fixes:

- 🚧 frontend/src/app/js/providers/MoveTokensAppProvider/MoveTokensAppContext.tsx
      Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
- remove api keys
