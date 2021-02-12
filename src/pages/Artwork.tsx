import { Button, Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArtMetadata } from "../db/ceramic";
import { ArtMetadata } from "../interface";
import { CIDToUrl } from "../ipfs";

export function Artwork() {
  const { artCID } = useParams() as any;
  const [metaData, setMetaData] = useState<ArtMetadata>();

  //@ts-ignore
  useEffect(async () => {
    if (!artCID) return;
    const _metaData = await getArtMetadata(artCID);
    setMetaData(_metaData);
  }, artCID);

  return (
    <>
      <Grid
        container
        direction="column"
        alignItems="center"
        style={{ position: "relative" }}
      >
        <h2>Artwork</h2>
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
          <Button variant="contained" color="primary">
            Buy
          </Button>
          <Button variant="contained" color="primary">
            Sell
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
