import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { getDesigns, getDesignTokens } from "../api/token";
import { artMetadataCIDToStegods } from "../db/ceramic";
import { ArtTokenBalance } from "../interface";

interface StegoArtData {
  url: string,
  fileName: string,
}

export function Profile() {
  const auth = window.walletConnection.isSignedIn();
  useEffect(() => {
    if (auth) window.location.href = `/user/${window.accountId}`;
  }, []);
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
    let proms: Promise<Uint8Array>[] = [];
    for (let i = 0; i < designs.length; i++) {
      proms.push(artMetadataCIDToStegods(designs[i]));
    }

    let srcBlobs = (await Promise.all(proms))
      .map((buff) => {
        try {
          const blob = new Blob([buff], { type: "image/png" });
          return URL.createObjectURL(blob)
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

  useEffect(() => {
    // in this case, we only care to query the contract when signed in
    if (window.walletConnection.isSignedIn()) {
      populateDesigns();
      updateTokenBalances();
    }
  }, []);

  const artworkDowloadItems = artworks.map((blobUrl) => (
    <a href={blobUrl as string} download={blobUrl as string}>
      {blobUrl as string}
    </a>
  ))

  return (
    <>
      <h1>{window.accountId} your designs are below. Enjoy!</h1>
      <br></br>
      <Grid container item xs={12} justify="space-between">
        {artworkDowloadItems}
      </Grid>
    </>
  )
}