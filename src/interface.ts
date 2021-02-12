export type CID = string;
export type AccountID = any;

export interface UserProfile {
  username: string;
}

export interface ArtMetadata {
  original: CID;
  stegod: CID;
  bases?: CID[];
}

export interface ArtTokenBalance {
  artworkCID: CID;
  amount: number;
}

export interface SellerInfo {
  seller: AccountID;
  totalSupply: number;
}
