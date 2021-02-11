import 'regenerator-runtime/runtime'
import React, { useState, useLayoutEffect, useEffect } from 'react'
import * as artistService from './components/services/ArtistService'
import 'jquery/dist/jquery.js';
import { login, logout } from './utils';
import './global.css';
import 'react-bootstrap';
import { Grid } from '@material-ui/core';
import { spacing } from '@material-ui/system';
import { makeStyles } from '@material-ui/core/styles';
import data from './testdata/data';
import Header from './components/Header';
import DesignCard from './components/DesignCard';
import ArtistForm from './form/ArtistForm';

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')


export default function App() {
  // use React Hooks to store design in component state
  const [designs, setDesigns] = useState([])
  const [buffer, setBuffer] = useState(null)

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = useState(true)

  const [mainDesign, setMainDesign] = useState([])

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
      async function fetchData() {
        setDesigns(() => data.map((data) => <DesignCard data={data}/>)
        )
      }
      fetchData()
      console.log(data)
    }
    ,[])

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
      <Header />
        <h1>
          {window.accountId} your designs are below. Enjoy!
        </h1>
         <br></br>
         <Grid container item xs={12} justify="space-between">
         {designs}
         </Grid>
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