
// import EventEmitter from 'eventemitter3'
import TOKENS_LISTS from '@utils/constants/tokensLists'
import { getTokensLists_TokenData } from '~/js/utils/tokensListsUtils';

console.debug(`tokensLists.js.js`)
/*
const createFrontendEventEmitter = () =>{
  try
  {
    const eventEmitter = new EventEmitter();
    {
      const frontendEventsEmitter = {
        on: (event, fn) => eventEmitter.on(event, fn),
        once: (event, fn) => eventEmitter.once(event, fn),
        off: (event, fn) => eventEmitter.off(event, fn),
        emit: (event, payload) => eventEmitter.emit(event, payload)
      }
      return Object.freeze(frontendEventsEmitter);
    }
  }
  catch (error)
  {
    console.error(`frontendEvents:createFrontendEventEmitter: ${error}`)
  }
} // createFrontendEventEmitter

const getFrontendEventEmitter = () =>{
  try
  {
    const frontendEventsEmitter = createFrontendEventEmitter()
    if (!frontendEventsEmitter) {
      throw "frontendEvents: getFrontendEventEmitter : unable to init frontend event emitter"
    }
    return frontendEventsEmitter;
  }
  catch (error)
  {
    console.error(`frontendEvents:getFrontendEventEmitter: ${error}`)
  }
} // createFrontendEventEmitter


const frontendEventsEmitter = getFrontendEventEmitter()
*/

const getTokenLists = async(tokenLists:TTokensLists) => {
  const tokensLists_TokenData = await getTokensLists_TokenData(tokenLists)
  return tokensLists_TokenData;
}

const tokenLists = await getTokenLists(TOKENS_LISTS);

export { tokenLists };