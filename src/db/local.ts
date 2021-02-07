import store from "store";
//@ts-ignore
import { randomBytes } from "@stablelib/random";

export async function getSeedOrNew() {
  if (!(await getSeed())) {
    const seed = randomBytes(32);
    await storeSeed(seed);
  }
  return Object.values(await getSeed());
}

async function getSeed() {
  return store.get("seed");
}

async function storeSeed(val: Uint8Array) {
  return store.set("seed", val);
}

export async function getProfileId(): Promise<string | null> {
  return store.get("profile-id", null);
}

export async function setProfileId(id: string) {
  store.set("profile-id", id);
}
