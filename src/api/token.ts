import { AccountID, ArtTokenBalance, CID } from "../interface";

export async function getDesigns(artist: AccountID): Promise<CID[]> {
  return await (window.contract as any).get_designs({ artist });
}

export async function getDesignTokens(user: AccountID): Promise<ArtTokenBalance[]> {
  const tuples = await (window.contract as any).get_design_tokens({ user });
  return tuples.map((tup: any) => ({
    artworkCID: tup[0],
    amount: tup[1]
  }));
}

export async function createToken(artwork: CID) {
  await (window.contract as any).create_token({ artwork });
}
