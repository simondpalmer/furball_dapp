import { Contract, WalletConnection } from 'near-api-js'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { initContract } from './utils'

declare global {
  interface Window {
    nearInitPromise: Promise<any>,
    walletConnection: WalletConnection,
    accountId: any,
    contract: Contract
  }
}

(window as any).nearInitPromise = initContract()
  .then(() => {
    ReactDOM.render(
      <App />,
      document.querySelector('#root')
    )
  })
  .catch(console.error)
