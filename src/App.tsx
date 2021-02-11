import "jquery/dist/jquery.js";
import React, { useEffect, useState } from "react";
import "react-bootstrap";
import "regenerator-runtime/runtime";
import stegasus from "../../stegasus/Cargo.toml";
import { createToken, getDesigns, getDesignTokens } from "./api/token";
import getConfig from "./config/config";
import { artMetadataCIDToStegods, createArtMetadata, uploadArt, uploadArtStegod } from "./db/ceramic";
import "./global.css";
import { ArtMetadata, ArtTokenBalance } from "./interface";
import { login, logout } from "./utils";


var Isotope = require("isotope-layout");

const { networkId } = getConfig(process.env.NODE_ENV || "development");

export default function App() {
  // use React Hooks to store design in component state
  const [artworks, setArtworks] = useState<(string | null)[]>([]);

  // balances of art tokens
  const [balances, setBalances] = useState<ArtTokenBalance[]>()

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = useState(true);

  // load in Isotope
  const [isotope, setIsotope] = useState(null);

  // manage scroll position
  const [scrollPosition, setScrollPosition] = useState(0);

  const [mainDesign, setMainDesign] = useState("#f69256");

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // optionally reference other artworks that this artwork is "based" on
  const [bases, setBases] = useState<string[]>([]);

  async function populateDesigns() {
    const designs = await getDesigns(window.accountId);
    let proms: Promise<Uint8Array>[] = [];
    for (let i = 0; i < designs.length; i++) {
      proms.push(artMetadataCIDToStegods(designs[i]));
    }

    let srcBlobs = (await Promise.all(proms))
      .map((buff) => {
        try {
          const blob = new Blob([new Uint8Array(buff, 0, buff.length)])
          return URL.createObjectURL(blob);
        } catch (e) {
          console.error("Error parsing to URL", e);
          return null;
        }
      })
      .filter((it) => it != null);
    setArtworks(srcBlobs);
  }

  async function updateTokenBalances() {
    const balances = await getDesignTokens(window.accountId);
    setBalances(balances);
  }

  async function uploadNewToken(e: React.FormEvent<HTMLFormElement>) {
    // TODO: loading wheel
    e.preventDefault();
    if (!selectedFile) {
      alert("Please upload a file");
      return;
    }
    const bufOriginalFile = await (selectedFile as File).arrayBuffer();
    // const bufFile = (e.target as any).files[0];
    const originalCID = await uploadArt(new Uint8Array(bufOriginalFile));
    // TODO: stego
    const stegMsg = "hello world";
    console.log(`stegoing message "${stegMsg}" into image`);
    const stegod = stegasus.encode_img(new Uint8Array(bufOriginalFile), new Uint8Array(Buffer.from(stegMsg)));
    const stegoMsgBuf = stegasus.decode_img(stegod);
    console.log(Buffer.from(stegoMsgBuf).toString())
    const stegoCID = await uploadArtStegod(new Uint8Array(bufOriginalFile));

    const artData: ArtMetadata = {
      stegod: stegoCID,
      original: originalCID,
      bases: bases.length === 0 ? undefined : bases
    };
    const artDataCID = await createArtMetadata(artData);
    await createToken(artDataCID);
    alert("Uploaded!");
    setBases([])
    setSelectedFile(null)
    await updateTokenBalances()
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
        <h1>{window.accountId} your designs are below. Enjoy!</h1>
        <div className="upload">
          <h2>Upload your designs here</h2>
          // TODO: allow linking of bases from tokens you own
          <form onSubmit={(e) => uploadNewToken(e)}>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              required
            />

            <input type="submit" />
          </form>
          <div className="row">
            <div className="col-4">
              <div
                className="tokenXL"
                style={{ backgroundColor: `${mainDesign}` }}
              ></div>
            </div>
            <div className="col-8">
              <div id="visContainer">
                {artworks.map((url) => {
                  return <img src={url} alt="" />;
                })}
                {/* {design.map((design, key) => {
                  return (
                    <div key={key} className="gridItem">
                      <div
                        className="token"
                        style={{ backgroundColor: design }}
                        onClick={(e) => {
                          setMainDesign(e.currentTarget.style.backgroundColor);
                        }}
                      ></div>
                    </div>
                  );
                })} */}
              </div>
            </div>
          </div>
        </div>
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
