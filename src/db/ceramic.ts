import CeramicClient from "@ceramicnetwork/http-client";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { ArtMetadata, UserProfile } from "../interface";
import { getProfileId, getSeedOrNew, setProfileId } from "./local";

export async function initCeramic() {
  const seed = new Uint8Array(await getSeedOrNew()); //  32 bytes with high entropy
  console.log(seed, await getSeedOrNew())
  const provider = new Ed25519Provider(seed);
  await ceramic.setDIDProvider(provider);
}

// TODO: parse out into env, for now j using a dev node connection that gets wiped
const API_URL = "https://ceramic-clay.3boxlabs.com";
const ceramic = new CeramicClient(API_URL);

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
    const doc = await ceramic.loadDocument(profId)
    if (doc) {
      return doc.content as UserProfile
    }
  }
  return null;
}

export async function createArtMetadata(data: ArtMetadata) {
  const doc = await ceramic.createDocument("tile", {
    content: {...data}
  })
  return doc.id.toString()
}

export async function uploadArt() {}

export async function uploadArtStegod() {}
