import { AccountID, ArtTokenBalance, CID } from "../interface";

export async function getDesigns(artist: AccountID): Promise<CID[]> {
  return await (window.contract as any).get_designs({ artist });
}

export async function getDesignTokens(
  user: AccountID
): Promise<ArtTokenBalance[]> {
  console.log(user);
  const tuples = await (window.contract as any).get_design_tokens({ user });
  return tuples.map((tup: any) => ({
    artworkCID: tup[0],
    amount: tup[1],
  }));
}

export async function getBalance(
  art: CID,
  owner_id: AccountID
): Promise<number> {
  return await (window.contract as any).get_balance({ art, owner_id });
}

export async function getArtistFromAccountId(
  artist_account: AccountID
): Promise<CID> {
  console.log(artist_account);
  return await (window.contract as any).artist_account_id_lookup({
    artist_account,
  });
}

export async function getCostPerToken(art: CID): Promise<number> {
  return await (window.contract as any).cost_per_token({ art });
}

export async function getAmountOnSale(art: CID): Promise<number> {
  return await (window.contract as any).get_amount_on_sale({ art });
}

export async function getAllSellers(art: CID): Promise<any[]> {
  return await (window.contract as any).get_all_sellers({ art });
}

export async function putOnSale(art: CID, numbCoins: number) {
  console.log(numbCoins);
  await (window.contract as any).put_on_sale({ art, amount: `${numbCoins}` });
}

export async function createToken(artwork: CID) {
  await (window.contract as any).create_token({ artwork });
}

export async function buy(
  artwork: CID,
  amount: number,
  token_owner: AccountID,
  cost_per_token: number
) {
  await (window.contract as any)
    .buy({ art: artwork, amount, token_owner }, 0, (amount * cost_per_token))

}
