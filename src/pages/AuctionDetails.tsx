import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { Auction, Bid } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const AuctionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [amount, setAmount] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    API.get<Auction[]>("/api/auctions").then((res) => {
      const found = res.data.find((a) => a.id === Number(id));
      if (found) setAuction(found);
    });
    API.get<Bid[]>(`/api/auctions/${id}/bids`).then((res) => setBids(res.data));

    // WebSocket connection
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        client.subscribe(`/topic/auction/${id}`, (msg) => {
          const data = JSON.parse(msg.body);
          setMessages((prev) => [...prev, data.message]);
          setAuction((prev) =>
            prev ? { ...prev, currentPrice: data.amount } : prev
          );
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => { client.deactivate(); };
  }, [id]);

  const placeBid = async () => {
    try {
      await API.post("/api/auctions/bid", {
        auctionId: Number(id),
        amount: parseFloat(amount),
      });
      setAmount("");
      const res = await API.get<Bid[]>(`/api/auctions/${id}/bids`);
      setBids(res.data);
      toast.success("Bid placed successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Bid failed");
    }
  };

  if (!auction) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl flex gap-8">
        <div className="flex-1">
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">{auction.title}</h2>
              <p className="text-gray-600 mb-4">{auction.description}</p>
              <div className="mb-4">
                <p className="text-lg">Starting Price: ₹{auction.startingPrice}</p>
                <h2 className="text-3xl font-bold text-green-600">Current Price: ₹{auction.currentPrice}</h2>
                <p>Status: <span className={auction.status === "ACTIVE" ? "text-green-600" : "text-red-600"}>{auction.status}</span></p>
              </div>

              {/* Place Bid */}
              {auction.status === "ACTIVE" && (
                <div className="flex gap-4 mb-6">
                  <Input
                    className="flex-1"
                    placeholder={`Enter amount > ₹${auction.currentPrice}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <Button onClick={placeBid}>
                    Place Bid 🔨
                  </Button>
                </div>
              )}

              {/* Live Feed */}
              <Card>
                <CardHeader>
                  <CardTitle>⚡ Live Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  {messages.length === 0 && <p className="text-gray-500">No bids yet</p>}
                  {messages.map((m, i) => (
                    <div key={i} className="text-green-600 py-1 border-b border-gray-200 last:border-b-0">
                      {m}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Bid History */}
        <div className="w-80">
          <Card>
            <CardHeader>
              <CardTitle>Bid History</CardTitle>
            </CardHeader>
            <CardContent>
              {bids.map((b) => (
                <div key={b.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <span>👤 {b.bidder.username}</span>
                  <span className="font-bold text-green-600">₹{b.amount}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
