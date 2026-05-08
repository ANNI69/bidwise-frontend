export interface User {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "BIDDER" | "AUCTIONEER";
}

export interface Auction {
  id: number;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  status: "UPCOMING" | "ACTIVE" | "CLOSED";
  startTime: string;
  endTime: string;
  createdBy: User;
}

export interface Bid {
  id: number;
  amount: number;
  bidTime: string;
  bidder: User;
  auction: Auction;
}

export interface AuthResponse {
  token: string;
  role: string;
  username: string;
}
