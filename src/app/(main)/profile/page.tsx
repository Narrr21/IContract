"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { ErrorDisplay } from "@/components/custom/error-display";

// Definisikan tipe untuk data pengguna
interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  initials: string;
}

// Komponen Skeleton untuk placeholder saat loading
function ProfileSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="items-center text-center">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2 mt-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32 ml-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    // 2. Pastikan fungsi fetch terpisah
    setIsLoading(true);
    setError(null); // Reset error setiap kali mencoba lagi
    try {
      const response = await fetch("/api/me");
      if (!response.ok) {
        throw new Error("Failed to fetch user data. Please log in.");
      }
      const data = await response.json();
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // 3. Ganti blok error lama dengan komponen ErrorDisplay
  if (error) {
    return (
      <ErrorDisplay
        message={error}
        onRetry={fetchUserData} // Berikan fungsi untuk tombol "Coba Lagi"
      />
    );
  }

  if (!user) {
    // Jika tidak loading dan tidak ada error, tapi user tetap null
    // Ini bisa terjadi jika pengguna belum login.
    return (
      <ErrorDisplay
        title="Access Denied"
        message="You must be logged in to view this page."
      />
    );
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 dark:bg-gray-950 p-4 pt-16">
      <Card className="w-full max-w-2xl">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
            />
            <AvatarFallback className="text-3xl">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl">{`${user.firstName} ${user.lastName}`}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" defaultValue={user.firstName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" defaultValue={user.lastName} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user.email}
                disabled
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
