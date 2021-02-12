import CeramicClient from "@ceramicnetwork/http-client";

// import BufferList from "bl/BufferList";
import { NearWalletProvider } from "key-did-provider-ed25519";
import { ArtMetadata, CID, UserProfile } from "../interface";
import { getProfileId, setProfileId } from "./local";

// TODO: parse out into env, for now j using a dev node connection that gets wiped
// const API_URL = "http://localhost:7007";
const API_URL = "https://gateway-clay.ceramic.network";
const ceramic = new CeramicClient(API_URL);

export async function initCeramic() {
  const accountId = window.accountId;
  const networkId = window.walletConnection._networkId;
  const keyPair = await window.walletConnection._keyStore.getKey(
    networkId,
    accountId
  );
  const provider = new NearWalletProvider(keyPair);
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

export async function artMetadataCIDToStegodCID(
  artMetadataCID: CID
): Promise<Uint8Array> {
  const artmetadata = await getArtMetadata(artMetadataCID);
  return artmetadata.stegod;
}

export async function artMetadataCIDToStegods(
  artMetadataCID: CID
): Promise<Uint8Array> {
  const artmetadata = await getArtMetadata(artMetadataCID);
  const stegod = await getArtStegod(artmetadata.stegod);
  console.log(stegod);
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
  // const doc = await ceramic.loadDocument(stegod);
  // return doc.content.data as Uint8Array
  let mastBuf = [];
  console.log(stegod)
  for await (const file of window.ipfs.get(stegod)) {
    console.log(file.path);
    const buffers: Buffer[] = [];
    for await (const chunk of file.content) {
      buffers.push(chunk);
    }
    mastBuf.push(buffers)
  }
  console.log(mastBuf)
  // mastBuf.flatten()
  console.log(mastBuf)
  const flat = [].concat.apply([], mastBuf);
  return new Uint8Array(...flat);
}
