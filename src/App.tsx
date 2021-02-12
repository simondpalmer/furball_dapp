import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import "react-bootstrap";
import "regenerator-runtime/runtime";
import { createToken, getDesigns, getDesignTokens } from "./api/token";
import Header from "./components/Header";
import getConfig from "./config/config";
import { artMetadataCIDToStegods, artMetadataCIDToStegodCID } from "./db/ceramic";
import "./global.css";
import { ArtMetadata, ArtTokenBalance } from "./interface";
import { login, logout } from "./utils";

var Isotope = require("isotope-layout");

const { networkId } = getConfig(process.env.NODE_ENV || "development");

export default function App() {
  // use React Hooks to store design in component state
  const [artworks, setArtworks] = useState<(string | null)[]>([]);

  // balances of art tokens
  const [balances, setBalances] = useState<ArtTokenBalance[]>();

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = useState(true);

  // load in Isotope
  const [isotope, setIsotope] = useState(null);

  // manage scroll position
  const [scrollPosition, setScrollPosition] = useState(0);

  const [mainDesign, setMainDesign] = useState("#f69256");

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = useState(false);

  // optionally reference other artworks that this artwork is "based" on
  const [bases, setBases] = useState<string[]>([]);

  async function populateDesigns() {
    const designs = await getDesigns(window.accountId);
    console.log(designs);
    let proms: Promise<Uint8Array>[] = [];
    for (let i = 0; i < designs.length; i++) {
      proms.push(artMetadataCIDToStegodCID(designs[i]));
    }

    
    const cids = await Promise.all(proms)
    setArtworks(cids.map(cid => `https://ipfs.infura.io/ipfs/${cid}`));
  }

  async function updateTokenBalances() {
    const balances = await getDesignTokens(window.accountId);
    setBalances(balances);
  }

  useEffect(() => {
    // in this case, we only care to query the contract when signed in
    if (window.walletConnection.isSignedIn()) {
      populateDesigns();
      updateTokenBalances();
    }
  }, []);

  useEffect(() => {
    const elem = document.querySelector("#visContainer");
    setIsotope(
      new Isotope(elem, {
        itemSelector: ".gridItem",
        layoutMode: "masonry",
        masonry: {
          columnWidth: 200,
          fitWidth: true,
        },
      })
    );
  }, []);

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Welcome to FurBall</h1>
        <p>
          To add your images you need to sign in. The button below will sign you
          in using NEAR Wallet.
        </p>
        <p>
          By default, when your app runs in "development" mode, it connects to a
          test network ("testnet") wallet. This works just like the main network
          ("mainnet") wallet, but the NEAR Tokens on testnet aren't convertible
          to other currencies – they're just for testing!
        </p>
        <p>Go ahead and click the button below to try it out:</p>
        <p style={{ textAlign: "center", marginTop: "2.5em" }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    );
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button
        className="link"
        style={{ position: "fixed", float: "right" }}
        onClick={logout}
      >
        Sign out
      </button>
      <main>
        <Header />
        <h1>{window.accountId} your designs are below. Enjoy!</h1>
        <br></br>
        <Grid container item xs={12} justify="space-between">
          {/* {designs} */}
          {artworks.map((url, i) => 
              <img class="artwork-tile" src={url} key={`img-${i}`} alt="" srcset="" />
          )}
        </Grid>
      </main>
      {showNotification && <Notification />}
    </>
  );
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`;
  return (
    <aside>
      <a
        target="_blank"
        rel="noreferrer"
        href={`${urlPrefix}/${window.accountId}`}
      >
        {window.accountId}
      </a>
      {
        " " /* React trims whitespace around tags; insert literal space character when needed */
      }
      called method: 'setDesign' in contract:{" "}
      <a
        target="_blank"
        rel="noreferrer"
        href={`${urlPrefix}/${window.contract.contractId}`}
      >
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  );
}
