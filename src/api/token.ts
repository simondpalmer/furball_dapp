import { AccountID, ArtTokenBalance, CID } from "../interface";

export async function getDesigns(artist: AccountID): Promise<CID[]> {
  return await (window.contract as any).get_designs({ artist });
}

export async function getDesignTokens(
  user: AccountID
): Promise<ArtTokenBalance[]> {
  const tuples = await (window.contract as any).get_design_tokens({ user });
  return tuples.map((tup: any) => ({
    artworkCID: tup[0],
    amount: tup[1],
  }));
}

export async function getCostPerToken(art: CID): Promise<number> {
  return await (window.contract as any).cost_per_token({ art });
}

export async function getAmountOnSale(art: CID): Promise<number> {
  return await (window.contract as any).get_amount_on_sale({ art });
}

export async function getAllSellers(art: CID) {
  return await (window.contract as any).get_all_sellers({ art });
}

export async function buy(
  art: CID,
  numb_coins: number,
  token_owner: AccountID
) {}

export async function getArtworkCidFromOriginalCid(
  original: CID
): Promise<CID | null> {
  return await (window.contract as any).get_artwork_cid_of_original_cid({
    original_cid: original,
  });
}

export async function createToken(artwork: CID, original: CID) {
  await (window.contract as any).create_token({ artwork, original });
}
