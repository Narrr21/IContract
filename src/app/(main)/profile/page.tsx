"use client";

import { useState, useEffect, useRef } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ErrorDisplay } from "@/components/custom/error-display";
import { 
  User, 
  Camera, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Badge as BadgeIcon,
  Eye,
  EyeOff
} from "lucide-react";

// Definisikan tipe untuk data pengguna
interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  category: string;
  profilePath: string;
  employeeId: string;
  phoneNumber: string;
  address: string;
  birthDate: string;
  joinDate: string;
  department: string;
  position: string;
  initials: string;
}

// Komponen Skeleton untuk placeholder saat loading
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-2 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Dialog untuk ubah password
function ChangePasswordDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/account/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error occurred");
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      alert("Password changed successfully!");
      onClose();
    } catch (err: any) {
      console.error("Change password error:", err);
      setError(err.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords.current ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPasswords.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data - dalam implementasi nyata, ini akan diambil dari API
  const mockUser: UserProfile = {
    id: 1,
    firstName: "Ahmad",
    lastName: "Wijaya",
    email: "ahmad.wijaya@company.com",
    category: "ADMIN",
    profilePath: "/images/default-avatar.png",
    employeeId: "EMP001",
    phoneNumber: "+62 812-3456-7890",
    address: "Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190",
    birthDate: "1990-05-15",
    joinDate: "2020-01-15",
    department: "Information Technology",
    position: "System Administrator",
    initials: "AW"
  };

  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/account/profile");
      
      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("API response is not JSON, using mock data");
        setUser(mockUser);
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch user data. Please log in.");
      }
      
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        throw new Error(data.error || "Failed to fetch user data");
      }
    } catch (err: any) {
      console.error("Error fetching user data:", err);
      setError(err.message);
      // Fallback to mock data for demo purposes
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('userId', user?.id.toString() || '');

      const response = await fetch('/api/account/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const result = await response.json();
      if (user) {
        setUser({ ...user, profilePath: result.photoUrl });
      }
      
      alert('Profile photo updated successfully!');
    } catch (err: any) {
      alert('Failed to upload photo: ' + err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'MANAGEMENT':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'HR':
        return 'bg-green-100 text-green-800';
      case 'LEGAL':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <ErrorDisplay
        message={error}
        onRetry={fetchUserData}
      />
    );
  }

  if (!user) {
    return (
      <ErrorDisplay
        title="Access Denied"
        message="You must be logged in to view this page."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Photo */}
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src={user.profilePath}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                  <AvatarFallback className="text-4xl">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full h-10 w-10 p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">{user.position}</p>
                    <p className="text-gray-500">{user.department}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Badge className={getCategoryBadgeColor(user.category)}>
                      {user.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Security Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Employee ID */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <BadgeIcon className="h-4 w-4" />
                      <span>Employee ID</span>
                    </Label>
                    <Input value={user.employeeId} disabled />
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Full Name</span>
                    </Label>
                    <Input value={`${user.firstName} ${user.lastName}`} disabled />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </Label>
                    <Input value={user.email} disabled />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone Number</span>
                    </Label>
                    <Input value={user.phoneNumber} disabled />
                  </div>

                  {/* Birth Date */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Birth Date</span>
                    </Label>
                    <Input 
                      value={new Date(user.birthDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })} 
                      disabled 
                    />
                  </div>

                  {/* Join Date */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Join Date</span>
                    </Label>
                    <Input 
                      value={new Date(user.joinDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })} 
                      disabled 
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Address</span>
                    </Label>
                    <Input value={user.address} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-gray-500">
                          Last changed on {new Date().toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => setIsPasswordDialogOpen(true)}>
                      Change Password
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Security Tips</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use a strong password with at least 8 characters</li>
                      <li>• Include uppercase, lowercase, numbers, and symbols</li>
                      <li>• Don't share your password with anyone</li>
                      <li>• Change your password regularly</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Change Password Dialog */}
        <ChangePasswordDialog 
          isOpen={isPasswordDialogOpen} 
          onClose={() => setIsPasswordDialogOpen(false)} 
        />
      </div>
    </div>
  );
}
