import { Button, Grid, Input } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { buy, getAllSellers, getBalance, getCostPerToken, putOnSale } from "../api/token";
import { getArtMetadata } from "../db/ceramic";
import { AccountID, ArtMetadata, SellerInfo } from "../interface";
import { CIDToUrl } from "../ipfs";

export function Artwork() {
  const { artCID } = useParams() as any;
  const [tokenCost, setTokenCost] = useState(0);
  const [amountBuy, setAmountBuy] = useState<number[]>([]);
  const [tokensOnSale, setTokensOnSale] = useState(0);
  const [sellers, setSellers] = useState<SellerInfo[]>([]);
  const [bal, setBal] = useState(0);
  const [amountSell, setAmountSell] = useState(0);
  const [metaData, setMetaData] = useState<ArtMetadata>();

  async function makePurchase(seller: AccountID, coinsToBuy: number) {
    try {
      await buy(artCID, coinsToBuy, seller, tokenCost);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert(
        "There was an error making the purchase! Please make sure that you attach sufficient funds to cover your purchase"
      );
    }
  }

  //@ts-ignore
  useEffect(async () => {
    if (!artCID) return;
    const _metaData = await getArtMetadata(artCID);
    setMetaData(_metaData);
    setTokenCost(await getCostPerToken(artCID));
    setBal(await getBalance(artCID, window.accountId));
    // TODO: get all sellers not working, s
    let sellers = await getAllSellers(artCID);
    // If there is only one seller, than a 1D array is returned by getAllSellers
    // So, it must be made 2D
    if (sellers.length === 2 && Number(sellers[1])) {
      sellers = [sellers];
    }
    const mySeller: any = sellers.filter(
      (seller) => seller[0] === window.accountId
    );
    if (mySeller.length === 1) {
      setTokensOnSale(mySeller[0][1]);
    }
    setAmountBuy(new Array(sellers.length).fill(0));
    setSellers(sellers);
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
        <p>
          You have a balance of {bal} tokens. Each token costs {tokenCost} Near.
          You currently have {tokensOnSale} on sale.
        </p>
        <img
          style={{ maxWidth: "800px", margin: "1rem" }}
          src={CIDToUrl(metaData?.stegod)}
          alt=""
        />
        <Grid
          container
          className="actions"
          justify="center"
          direction="row"
          style={{ width: "100%" }}
        >
          {/* TODO: */}
          <Input
            type="number"
            value={amountSell}
            onChange={(e) => setAmountSell(parseInt(e.target.value))}
          ></Input>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              await putOnSale(artCID, amountSell);
              window.location.reload();
            }}
          >
            Put on sale
          </Button>
        </Grid>
        <div className="spacer" style={{ height: "100px" }}></div>
        <Grid container justify="center">
          {sellers.map((seller, i) => (
            <Grid container justify="center" key={`buy-from-${i}`}>
              {(seller[0] == window.accountId && (
                <p>You cannot buy from yourself</p>
              )) || (
                  <Input
                    type="number"
                    value={amountBuy[i]}
                    onChange={(e) => {
                      amountBuy[i] = parseInt(e.target.value);
                      setAmountBuy([...amountBuy]);
                    }}
                  ></Input>
                )}
              <Button
                variant="contained"
                color={seller[0] == window.accountId ? "disabled" : "primary"}
                onClick={() => makePurchase(seller[0], amountBuy[i])}
              >
                Buy a maximum of {seller[1]} from {seller[0]}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </>
  );
}
