import { Button, Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArtMetadata } from "../db/ceramic";
import { ArtMetadata } from "../interface";
import { CIDToUrl } from "../ipfs";

export function Artwork() {
  const { artCID } = useParams() as any;
  const [metaData, setMetaData] = useState<ArtMetadata>();
  useEffect(async () => {
    if (!artCID) return;
    const _metaData = await getArtMetadata(artCID);
    setMetaData(_metaData);
  }, artCID);
  return (
    <>
      <Grid container direction="column" alignItems="center">
        <h2>Artwork</h2>
        <img
          style={{ maxWidth: "800px" }}
          src={CIDToUrl(metaData?.stegod)}
          alt=""
          srcset=""
        />
        <div className="actions">
          <Button color="primary">Buy</Button>
          <Button color="primary">Sell</Button>
        </div>
      </Grid>
    </>
  );
}
