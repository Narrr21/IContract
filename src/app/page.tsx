"use client"; // Diperlukan untuk menggunakan useRouter

import { useRouter } from "next/navigation"; // Import useRouter
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Import ikon dari lucide-react
import {
  Search,
  Settings,
  Clock,
  HelpCircle,
  List,
  Grip,
  ChevronDown,
  FolderIcon,
  GripVertical,
  MoreVertical,
} from "lucide-react";

// Data tiruan yang diperbarui dengan field baru
const contracts = [
  {
    id: 1,
    name: "Master Service Agreement",
    status: "Active",
    type: "Services",
    counterParty: "Tech Solutions Inc.",
    expiryDate: "2026-12-31",
  },
  {
    id: 2,
    name: "Non-Disclosure Agreement",
    status: "Archived",
    type: "Legal",
    counterParty: "Innovate Co.",
    expiryDate: "2025-05-20",
  },
  {
    id: 3,
    name: "Consulting Agreement",
    status: "Active",
    type: "Consulting",
    counterParty: "Growth Partners",
    expiryDate: "2027-01-15",
  },
  {
    id: 4,
    name: "Employee Offer Letter",
    status: "Active",
    type: "HR",
    counterParty: "Jane Doe",
    expiryDate: "N/A",
  },
  {
    id: 5,
    name: "Partnership Agreement",
    status: "Archived",
    type: "Business",
    counterParty: "Synergy Corp.",
    expiryDate: "2028-11-01",
  },
];

export default function DashboardPage() {
  const router = useRouter(); // Inisialisasi router

  const handleRowClick = (contractId: number) => {
    // Arahkan ke halaman detail kontrak
    router.push(`/contracts/${contractId}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100/40 dark:bg-gray-800/40">
      {/* 1. Header Utama */}
      <header className="flex h-14 items-center gap-4 border-b bg-white px-6 dark:bg-gray-950">
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-lg bg-orange-500 text-white px-2 py-1 rounded">
            CW
          </span>
        </div>
        <div className="flex-1">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 w-full"
            />
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Settings className="h-5 w-5" />
          <Clock className="h-5 w-5" />
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <HelpCircle className="h-5 w-5" />
        </nav>
      </header>

      {/* Konten Utama */}
      <main className="flex-1 p-6">
        {/* Header Konten */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Contracts</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  View <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>List</DropdownMenuItem>
                <DropdownMenuItem>Grid</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon" className="bg-gray-200">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Grip className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex items-center gap-2 mb-4">
          {/* Filter Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Status <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Checkbox id="status-active" className="mr-2" />
                <Label htmlFor="status-active">Active</Label>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Checkbox id="status-archived" className="mr-2" />
                <Label htmlFor="status-archived">Archived</Label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter Tipe */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Type <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Checkbox id="type-services" className="mr-2" />
                <Label htmlFor="type-services">Services</Label>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Checkbox id="type-legal" className="mr-2" />
                <Label htmlFor="type-legal">Legal</Label>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Checkbox id="type-hr" className="mr-2" />
                <Label htmlFor="type-hr">HR</Label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter Tanggal */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Date <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2">
              <div className="grid gap-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" />
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="date" />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tombol Sortir */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Sort by <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Name</DropdownMenuItem>
              <DropdownMenuItem>Expiry Date</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Checkbox id="sort-desc" className="mr-2" />
                <Label htmlFor="sort-desc">Descending</Label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabel Konten */}
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Counterparty</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow
                  key={contract.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleRowClick(contract.id)}
                >
                  <TableCell>
                    <Checkbox onClick={(e) => e.stopPropagation()} />
                  </TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <FolderIcon className="h-5 w-5 text-gray-600" />
                    {contract.name}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        contract.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {contract.name}
                    </span>
                  </TableCell>
                  <TableCell>{contract.type}</TableCell>
                  <TableCell>{contract.counterParty}</TableCell>
                  <TableCell>{contract.expiryDate}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
