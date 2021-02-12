import IPFS from "ipfs-http-client";
export async function initIPFS() {
 const ipfsClient = IPFS({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
  });
  window.ipfs = ipfsClient
}

export async function CIDToUrl(cid: string) {
  return `https://ipfs.infura.io/ipfs/${cid}`
}
