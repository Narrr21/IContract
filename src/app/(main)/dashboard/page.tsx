"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { useApi } from "@/lib/apiClient";
import { useContractToasts } from "@/components/ui/contract-toasts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ChevronDown,
  FileText,
  Filter,
  ArrowUpDown,
  Loader2,
  Edit,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// TypeScript interfaces
interface Contract {
  id: number;
  name: string;
  status: string;
  type: string;
  counterParty: string;
  expiryDate: string;
  startDate: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterOptions {
  statusOptions: string[];
  typeOptions: string[];
  sortOptions: { value: string; label: string }[];
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const api = useApi();
  const ctoast = useContractToasts();

  // Data states
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    statusOptions: [],
    typeOptions: [],
    sortOptions: [],
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch contracts
  const lastParamsRef = useRef<string | null>(null);
  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      search: debouncedSearch,
      status: selectedStatuses.join(","),
      type: selectedTypes.join(","),
      sortBy,
      sortOrder,
      page: currentPage.toString(),
      limit: pagination.limit.toString(),
    });
    const paramsString = params.toString();
    if (lastParamsRef.current === paramsString) {
      // Prevent refetch if nothing changed
      setLoading(false);
      return;
    }
    lastParamsRef.current = paramsString;
    const { ok, data, error } = await api.get<any>(`/api/list?${params}`, {
      silent: true,
    });
    if (!ok || !data?.success) {
      setError(error || data?.error || "Gagal memuat kontrak");
      ctoast.network();
    } else {
      setContracts(data.contracts);
      setPagination(data.pagination);
    }
    setLoading(false);
    // ctoast sudah stabil (memoized) sekarang; dependensi aman
  }, [
    api,
    debouncedSearch,
    selectedStatuses,
    selectedTypes,
    sortBy,
    sortOrder,
    currentPage,
    pagination.limit,
    ctoast,
  ]);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    const { ok, data } = await api.request<any>("/api/list", {
      method: "OPTIONS",
      silent: true,
    });
    if (ok && data) setFilterOptions(data);
  }, [api]);

  // Effects
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, selectedStatuses, selectedTypes, sortBy, sortOrder]);

  // Event handlers
  const handleRowClick = (contractId: number) => {
    router.push(`/contracts/${contractId}`);
  };

  const handleStatusFilter = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedStatuses((prev) => [...prev, status]);
    } else {
      setSelectedStatuses((prev) => prev.filter((s) => s !== status));
    }
  };

  const handleTypeFilter = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes((prev) => [...prev, type]);
    } else {
      setSelectedTypes((prev) => prev.filter((t) => t !== type));
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const handleStatusChange = async (contractId: number, newStatus: string) => {
    const { ok } = await api.request(`/api/contract?id=${contractId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
      successMessage: "Status diperbarui",
      processingMessage: "Mengubah status...",
    });
    if (ok) {
      setContracts((prev) =>
        prev.map((c) => (c.id === contractId ? { ...c, status: newStatus } : c))
      );
    } else {
      ctoast.network();
    }
  };

  const handleEditContract = (contractId: number) => {
    router.push(`/contracts/${contractId}/edit`);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "aktif":
        return "bg-green-50 text-green-700 border border-green-200";
      case "draft":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "archived":
      case "berakhir":
        return "bg-red-50 text-red-700 border border-red-200";
      case "terminated":
      case "dihentikan":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const activeFiltersCount =
    selectedStatuses.length + selectedTypes.length + (debouncedSearch ? 1 : 0);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchContracts}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Daftar Kontrak
          </h1>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Cari kontrak.."
              className="pl-10 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white border-gray-200 hover:bg-gray-50 rounded-lg h-11 px-4"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-4">
              <div className="space-y-4">
                {/* Status Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Status
                  </Label>
                  <div className="space-y-2">
                    {filterOptions.statusOptions.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={selectedStatuses.includes(status)}
                          onCheckedChange={(checked) =>
                            handleStatusFilter(status, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`status-${status}`}
                          className="capitalize text-sm"
                        >
                          {status}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Type</Label>
                  <div className="space-y-2">
                    {filterOptions.typeOptions.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked) =>
                            handleTypeFilter(type, checked as boolean)
                          }
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Clear all filters
                    </Button>
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white border-gray-200 hover:bg-gray-50 rounded-lg h-11 px-4"
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Urutkan
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {filterOptions.sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => setSortBy(option.value)}
                  className={sortBy === option.value ? "bg-blue-50" : ""}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Checkbox
                  id="sort-desc"
                  className="mr-2"
                  checked={sortOrder === "desc"}
                  onCheckedChange={(checked) =>
                    setSortOrder(checked ? "desc" : "asc")
                  }
                />
                <Label htmlFor="sort-desc">Descending</Label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contract List Header */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4">
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-t-lg border-b border-gray-200 text-sm font-medium text-gray-700">
            <div className="col-span-4">Nama dokumen</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Counterparty</div>
            <div className="col-span-2">Jatuh tempo</div>
            <div className="col-span-1">Aksi</div>
          </div>

          {/* Contract List */}
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Loading contracts...</span>
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No contracts found</p>
                <p className="text-sm">
                  Try adjusting your search or filter criteria
                </p>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="link"
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors relative"
                >
                  {/* Document Icon & Name */}
                  <div
                    className="col-span-4 flex items-center cursor-pointer"
                    onClick={() => handleRowClick(contract.id)}
                  >
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-900 truncate">
                      {contract.name}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="col-span-2 flex items-center">
                    <Select
                      value={contract.status}
                      onValueChange={(newStatus) =>
                        handleStatusChange(contract.id, newStatus)
                      }
                    >
                      <SelectTrigger className="w-full h-8 text-sm border-0 bg-transparent hover:bg-gray-100 focus:ring-0">
                        <div
                          className={`px-3 py-1 text-sm rounded-full capitalize ${getStatusBadgeColor(
                            contract.status
                          )}`}
                        >
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="berakhir">Berakhir</SelectItem>
                        <SelectItem value="dihentikan">Dihentikan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Counterparty */}
                  <div
                    className="col-span-3 flex items-center cursor-pointer"
                    onClick={() => handleRowClick(contract.id)}
                  >
                    <span className="text-gray-900 truncate">
                      {contract.counterParty}
                    </span>
                  </div>

                  {/* Expiry Date */}
                  <div
                    className="col-span-2 flex items-center cursor-pointer"
                    onClick={() => handleRowClick(contract.id)}
                  >
                    <span className="text-gray-600">{contract.expiryDate}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditContract(contract.id);
                      }}
                      title="Edit PDF Kontrak"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {!loading && contracts.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.page * pagination.limit,
                pagination.totalCount
              )}{" "}
              of {pagination.totalCount} contracts
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPreviousPage}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="bg-white border-gray-200 hover:bg-gray-50"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="bg-white border-gray-200 hover:bg-gray-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
