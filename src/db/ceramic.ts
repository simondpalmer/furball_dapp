import CeramicClient from "@ceramicnetwork/http-client";
import { ArtMetadata, CID, UserProfile } from "../interface";
import { getProfileId, getSeedOrNew, setProfileId } from "./local";
import { Identity, Public } from "@textile/hub";
import { NearWalletProvider } from "key-did-provider-ed25519";


// TODO: parse out into env, for now j using a dev node connection that gets wiped
const API_URL = "https://ceramic-clay.3boxlabs.com";
const ceramic = new CeramicClient(API_URL);

export async function initCeramic() {
	const accountId = window.accountId;
	const networkId = window.walletConnection._networkId;
	const keyPair = await window
	    .walletConnection
	    ._keyStore
	    .getKey(networkId, accountId)
	const provider = new NearWalletProvider(keyPair)
	await ceramic.setDIDProvider(provider);
}

export async function upsertProfile(profile: UserProfile) {
  const profId = await getProfileId();
  if (profId) {
    const doc = await ceramic.loadDocument(profId);
    await doc.change({ content: { ...profile } });
    return doc.id.toString();
  } else {
    const doc = await ceramic.createDocument("tile", {
      content: { ...profile },
    });
    await setProfileId(doc.id.toString());
    return doc.id.toString();
  }
}

export async function getProfile() {
  const profId = await getProfileId();
  if (profId) {
    const doc = await ceramic.loadDocument(profId);
    if (doc) {
      return doc.content as UserProfile;
    }
  }
  return null;
}

export async function createArtMetadata(data: ArtMetadata) {
  const doc = await ceramic.createDocument("tile", {
    content: { ...data },
  });
  return doc.id.toString();
}

export async function getArtMetadata(artCID: CID): Promise<ArtMetadata> {
  return (await (await ceramic.loadDocument(artCID)).content) as ArtMetadata;
}

export async function artMetadataCIDToStegods(
  artMetadataCID: CID
): Promise<Uint8Array> {
  const artmetadata = await getArtMetadata(artMetadataCID);
  const stegod = await getArtStegod(artmetadata.stegod);
  return stegod;
}

async function uploadBlob(buff: Uint8Array) {
  const doc = await ceramic.createDocument("tile", {
    content: buff,
  });
  return doc.id.toString();
}

export async function uploadArt(img: Uint8Array) {
  return await uploadBlob(img);
}

export async function uploadArtStegod(img: Uint8Array) {
  return await uploadBlob(img);
}

async function getArtStegod(stegod: CID): Promise<Uint8Array> {
  const doc = await ceramic.loadDocument(stegod);
  return doc.content.data as Uint8Array
}
