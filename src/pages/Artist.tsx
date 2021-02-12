import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDesigns, getDesignTokens } from "../api/token";
import { artMetadataCIDToStegodCID } from "../db/ceramic";
import "../global.css";
import { ArtTokenBalance } from "../interface";
import { CIDToUrl } from "../ipfs";

export function Artist() {
  const [artworks, setArtworks] = useState<
    { ipfsImgCID: string; artworkCID: string }[]
  >([]);
  const { accountID } = useParams() as any;
  // balances of art tokens
  const [balances, setBalances] = useState<ArtTokenBalance[]>();

  async function populateDesigns() {
    const designs = await getDesigns(accountID);
    let proms: Promise<string>[] = [];
    for (let i = 0; i < designs.length; i++) {
      proms.push(artMetadataCIDToStegodCID(designs[i]));
    }

    const cids = await Promise.all(proms);
    console.log(cids.map(CIDToUrl));
    setArtworks(
      cids.map((cid, i) => {
        return {
          ipfsImgCID: cid,
          artworkCID: designs[i],
        };
      })
    );
  }

  async function updateTokenBalances() {
    const balances = await getDesignTokens(accountID);
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
      <h1>{accountID} your designs are below. Enjoy!</h1>
      <br></br>
      <Grid container item xs={12} justify="space-between">
        {/* {designs} */}
        {artworks.map((artwork, i) => (
          <a href={`/artwork/${artwork.artworkCID}`} key={`img-${i}`}>
            <img
              className="artwork-tile"
              src={CIDToUrl(artwork.ipfsImgCID)}
              alt=""
            />
            <p>Click to view this piece</p>
          </a>
        ))}
      </Grid>
    </>
  );
}
