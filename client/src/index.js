import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {PersistGate} from 'redux-persist/integration/react';
import {server} from './modules/server';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

var initialState = {
  username: '',
  loggedIn: false,
  account: {}, // user who logged in
  user: {}, // user of current posts
  posts: {},
  postIndex: 0,
  slideIndex: 0,
  dialog: {},
  replyTo: '',
  mode: '',
  count: 0
}

function reducer(state=initialState, action) {
  switch(action.type) {
    case 'USERNAME':
      return {...state, username: action.payload}
      break;
    case 'LOGGEDIN':
      return {...state, loggedIn: action.payload}
      break;
    case 'ACCOUNT':
      return {...state, account: action.payload}
      break;
    case 'USER':
      return {...state, user: action.payload}
      break;
    case 'POSTS':
      return {...state, posts: action.payload}
      break;
    case 'POSTINDEX':
      return {...state, postIndex: action.payload}
      break;
    case 'SLIDEINDEX':
      return {...state, slideIndex: action.payload}
      break;
    case 'DIALOG':
      return {...state, dialog: action.payload}
      break;
    case 'REPLYTO':
      return {...state, replyTo: action.payload}
      break;
    case 'MODE':
      return {...state, mode: action.payload}
      break;
    case 'COUNT':
      var count = state.count + action.payload;
      return {...state, count: count}
      break;
    default:
      return state;
      break;
  }
  return state;
}

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, reducer)

let store = createStore(persistedReducer)
let persistor = persistStore(store)

store.subscribe(() => {
  console.log("store changed", store.getState());
});

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
        <App />
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);
registerServiceWorker();
