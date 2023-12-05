# TODO

🚧 Enhancements

- Reorganize code (hooks, reducers)
- Transitions
- Modals
- More languages
- Data loading
- Add lock/unlock panel
- Reset target address or clear existing data on chain change

🚧 Migration fixes:

- frontend/src/app/js/providers/MoveTokensAppProvider/MoveTokensAppContext.tsx
  >  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.