import { Button, Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCostPerToken } from "../api/token";
import { getArtMetadata } from "../db/ceramic";
import { ArtMetadata } from "../interface";
import { CIDToUrl } from "../ipfs";

export function Artwork() {
  const { artCID } = useParams() as any;
  const [tokenCost, setTokenCost] = useState(0);
  // const [sellers, ]
  const [metaData, setMetaData] = useState<ArtMetadata>();

  //@ts-ignore
  useEffect(async () => {
    if (!artCID) return;
    const _metaData = await getArtMetadata(artCID);
    setMetaData(_metaData);
    setTokenCost(await getCostPerToken(artCID));
  }, artCID);
  useEffect(async () => {}, []);
  return (
    <>
      <Grid
        container
        direction="column"
        alignItems="center"
        style={{ position: "relative" }}
      >
        <h2>Artwork</h2>
        <p>
          There is a total supply of {0} tokens. Each token costs {tokenCost} Near
        </p>
        <img
          style={{ maxWidth: "800px", margin: "1rem" }}
          src={CIDToUrl(metaData?.stegod)}
          alt=""
          src=""
        />
        <Grid
          container
          className="actions"
          justify="space-around"
          direction="row"
          style={{ width: "100%" }}
        >
          {/* TODO: */}
          <Button variant="contained" color="primary">
            Sell
          </Button>
        </Grid>
        <Grid container>
          <Button variant="contained" color="primary">
            Buy from
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
