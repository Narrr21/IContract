"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  FileText,
  Briefcase,
  Users,
  Settings,
  PlusCircle,
  LayoutDashboard,
} from "lucide-react";
import { format } from "date-fns";

export default function DraftsPage() {
  const [contractType, setContractType] = useState("employment");
  const [effectiveDate, setEffectiveDate] = useState<Date>();

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr] border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
      <div className="flex flex-col w-full">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-2xl">
              Create Contract
            </h1>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Create Contract</Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Tabs defaultValue="main" className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="partnership">Partnership</TabsTrigger>
            </TabsList>

            {/* Main Tab Content */}
            <TabsContent value="employment" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Details</CardTitle>
                  <CardDescription>
                    Fill in the main details of the contract below.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Kolom Kiri */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="contract-number">Contract Number</Label>
                        <Input id="contract-number" defaultValue="SI9718" />
                      </div>
                      <div>
                        <Label htmlFor="contract-type">Contract Type</Label>
                        <Select
                          onValueChange={setContractType}
                          defaultValue={contractType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Contract Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employment">
                              Employment
                            </SelectItem>
                            <SelectItem value="partnership">
                              Partnership
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="contract-owner">Contract Owner</Label>
                        <Input id="contract-owner" defaultValue="Anne Hertz" />
                      </div>
                      <div>
                        <Label htmlFor="effective-date">Effective Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {effectiveDate ? (
                                format(effectiveDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={effectiveDate}
                              onSelect={setEffectiveDate}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Kolom Kanan */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="contract-title">Contract Title</Label>
                        <Input
                          id="contract-title"
                          placeholder="e.g. Senior Software Engineer Agreement"
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          defaultValue="Business Development"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contracting-parties">
                          Contracting Parties
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="contracting-parties"
                            placeholder="Select or Add New Parties"
                            className="flex-grow"
                          />
                          <Button type="button" size="icon" variant="outline">
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        {/* Menggunakan Textarea untuk deskripsi */}
                        <Textarea
                          id="description"
                          placeholder="Enter a brief description of the contract"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Placeholder untuk Tab Lain */}
            <TabsContent value="custom" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Fields</CardTitle>
                  <CardDescription>
                    Add custom fields specific to this contract type.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Custom fields will appear here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>
                    Upload and manage documents related to this contract.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Document upload functionality will be here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                  <CardDescription>
                    Add internal notes for your team.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea placeholder="Type your notes here..." />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
