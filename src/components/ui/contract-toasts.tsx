"use client";
// Preset toast helper khusus kontrak
import { toast, useToast } from "./toast";
import { useMemo } from "react";

/**
 * Hook yang menyediakan fungsi-fungsi siap pakai untuk menampilkan toast
 * standar terkait operasi kontrak (CRUD, validasi, jaringan, progres).
 */
export function useContractToasts() {
  const { push } = useToast();
  return useMemo(
    () => ({
      saved: () => toast.success(push, "Kontrak diperbarui"),
      deleted: (asSuccess: boolean = false) =>
        asSuccess
          ? toast.success(push, "Kontrak dihapus")
          : toast.warning(push, "Kontrak dihapus"),
      validation: (field?: string) =>
        toast.error(
          push,
          field
            ? `Field ${field} wajib diisi`
            : "Beberapa field wajib belum diisi"
        ),
      network: () => toast.error(push, "Koneksi bermasalah"),
      processing: (msg: string = "Memproses...") => toast.info(push, msg),
    }),
    [push]
  );
}

/**
 * Contoh penggunaan:
 *
 * import { useContractToasts } from "@/components/ui/contract-toasts";
 *
 * function MyComponent() {
 *   const t = useContractToasts();
 *
 *   async function handleSave() {
 *     t.processing();
 *     try {
 *       const res = await fetch('/api/contract/1', { method: 'PUT'});
 *       if (!res.ok) {
 *         if (res.status === 400) return t.validation();
 *         return t.network();
 *       }
 *       t.saved();
 *     } catch {
 *       t.network();
 *     }
 *   }
 * }
 */
