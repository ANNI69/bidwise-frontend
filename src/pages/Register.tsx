import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { AuthResponse } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";

const Register = () => {
  const [form, setForm] = useState({
    username: "", email: "", password: "", role: "BIDDER"
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const res = await API.post<AuthResponse>("/api/auth/register", form);
      login(res.data.token, res.data.username, res.data.role);
      navigate("/auctions");
    } catch (err) {
      toast.error("Registration failed. Email may already exist.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-gray-900">
            🏷️ BidWise
          </CardTitle>
          <p className="text-center text-gray-600">Register</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BIDDER">Bidder</SelectItem>
              <SelectItem value="AUCTIONEER">Auctioneer</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRegister} className="w-full">
            Register
          </Button>
          <p className="text-center text-gray-600">
            Have account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
