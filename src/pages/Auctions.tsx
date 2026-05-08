import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { Auction } from "../types";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const Auctions = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", startingPrice: "",
    startTime: "", endTime: ""
  });
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get<Auction[]>("/api/auctions").then((res) => setAuctions(res.data));
  }, []);

  const createAuction = async () => {
    try {
      await API.post("/api/auctions", {
        ...form,
        startingPrice: parseFloat(form.startingPrice),
      });
      const res = await API.get<Auction[]>("/api/auctions");
      setAuctions(res.data);
      setForm({ title: "", description: "", startingPrice: "", startTime: "", endTime: "" });
      toast.success("Auction created successfully");
    } catch (err) {
      toast.error("Failed to create auction");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Create Auction - Auctioneer only */}
        {role === "AUCTIONEER" && (
          <Card className="mb-8 max-w-md">
            <CardHeader>
              <CardTitle>Create Auction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <Input
                placeholder="Starting Price"
                value={form.startingPrice}
                onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
              />
              <Input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
              <Input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
              <Button onClick={createAuction} className="w-full">
                Create
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Auction List */}
        <h2 className="text-2xl font-bold mb-6">Live Auctions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((a) => (
            <Card
              key={a.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/auctions/${a.id}`)}
            >
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{a.title}</h3>
                <p className="text-gray-600 mb-4">{a.description}</p>
                <p className="text-lg font-medium">💰 Current: <span className="text-green-600">₹{a.currentPrice}</span></p>
                <p className="text-sm">📌 Status: <span className={a.status === "ACTIVE" ? "text-green-600" : "text-red-600"}>{a.status}</span></p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Auctions;
