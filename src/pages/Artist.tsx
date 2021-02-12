import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { getDesigns, getDesignTokens } from "../api/token";
import { artMetadataCIDToStegodCID } from "../db/ceramic";
import "../global.css";
import { ArtTokenBalance } from "../interface";
import { CIDToUrl } from "../ipfs";

export function Artist() {
  const [artworks, setArtworks] = useState<(string | null)[]>([]);

  // balances of art tokens
  const [balances, setBalances] = useState<ArtTokenBalance[]>();

  async function populateDesigns() {
    const designs = await getDesigns(window.accountId);
    let proms: Promise<string>[] = [];
    for (let i = 0; i < designs.length; i++) {
      proms.push(artMetadataCIDToStegodCID(designs[i]));
    }

    const cids = await Promise.all(proms);
    setArtworks(cids.map(CIDToUrl));
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
  return (
    <>
      <h1>{window.accountId} your designs are below. Enjoy!</h1>
      <br></br>
      <Grid container item xs={12} justify="space-between">
        {/* {designs} */}
        {artworks.map((url, i) => (
          <img
            className="artwork-tile"
            src={url || ""}
            key={`img-${i}`}
            alt=""
            srcset=""
          />
        ))}
      </Grid>
    </>
  );
}
