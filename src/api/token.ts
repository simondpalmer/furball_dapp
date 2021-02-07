import { AccountID, CID } from "../interface";

export async function getDesigns(artist: AccountID): Promise<CID[]> {
  return await (window.contract as any).get_designs({artist});
}

export async function createToken(artwork: CID) {
  await (window.contract as any).create_token({ artwork });
}
