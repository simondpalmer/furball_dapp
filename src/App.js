import 'regenerator-runtime/runtime'
import React, { useState, useLayoutEffect, useEffect } from 'react'
import ipfs from './ipfs'
import 'jquery/dist/jquery.js';
import { login, logout } from './utils'
import { useScrollPosition } from '@n8tb1t/use-scroll-position'
import './global.css'
import 'react-bootstrap';

var Isotope = require('isotope-layout');

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
  // use React Hooks to store design in component state
  const [design, setDesign] = useState(["#00b3ca", "#e38690", "#f69256", "#1d4e89", "#e38690", "#f69256", "#1d4e89", "#e38690", "#f69256", "#1d4e89"])

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = useState(true)

  // load in Isotope
  const [isotope, setIsotope] = useState(null);

  // manage scroll position
  const [scrollPosition, setScrollPosition] = useState(0)

  const [mainDesign, setMainDesign] = useState("#f69256")

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = useState(false)

  useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {

        // window.contract is set by initContract in index.js
        window.contract.get_design({ account_id: window.accountId })
          .then(designFromContract => {
            setDesign(designFromContract)
          })
      }
    },
    []
  )
  

  useEffect(() => {
    const elem = document.querySelector('#visContainer')  
      setIsotope(new Isotope( elem, {
          itemSelector: '.gridItem',
          layoutMode: 'masonry',
          masonry: {
            columnWidth: 200,
            fitWidth: true
          }
        })
      )
    },[]);

  //Load Furry images (ipfs hash)
  //setFurries()

  //Mint new furry tokens (ipfs hash)
    //QmU5eQ66pWzCAKGCWwRdM33nXK99aX9k9rYRGGhmAw552n
    // Example url: https://ipfs.infura.io/ipfs/QmU5eQ66pWzCAKGCWwRdM33nXK99aX9k9rYRGGhmAw552n


  //Transfer ipfs images (ipfs hash)

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Welcome to FurBall</h1>
        <p>
          To add your images you need to sign in. The button
          below will sign you in using NEAR Wallet.
        </p>
        <p>
          By default, when your app runs in "development" mode, it connects
          to a test network ("testnet") wallet. This works just like the main
          network ("mainnet") wallet, but the NEAR Tokens on testnet aren't
          convertible to other currencies – they're just for testing!
        </p>
        <p>
          Go ahead and click the button below to try it out:
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ position: 'fixed', float: 'right' }} onClick={logout}>
        Sign out
      </button>
      <main>
        <h1>
          {window.accountId} your designs are below. Enjoy!
        </h1>
        <div className="upload">
        <h2>Upload your designs here</h2>
         <form>
           <input type='file' onChange=""/>
           <input type='submit'/>
         </form>
         <div className="row">
           <div className="col-4">
             <div className="tokenXL" style={{backgroundColor: `${mainDesign}`}}></div>

           </div>
           <div className="col-8">
           <div id="visContainer">
           {design.map((design, key) => {
             return (
               <div key={key} className="gridItem">
                 <div className="token" style={{ backgroundColor: design}} onClick={(e) => {setMainDesign(e.currentTarget.style.backgroundColor)}}></div>
                 </div>
             )
           })}
           </div>
           </div>
         </div>
         </div>
      </main>
      {showNotification && <Notification />}
    </>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '/* React trims whitespace around tags; insert literal space character when needed */}
      called method: 'setDesign' in contract:
      {' '}
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}
