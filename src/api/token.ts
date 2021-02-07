import { AccountID, CID } from "./interface";

export async function getDesigns(artist: AccountID): Promise<CID[]> {
  return await (window.contract as any).get_designs({artist});
}

export async function createToken(artworkCID: CID) {
  await (window.contract as any).create_token({ artwork: "A Fake CID HERE" });
}
