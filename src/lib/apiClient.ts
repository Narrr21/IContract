"use client";
import { useCallback, useMemo } from 'react';
import { useToast, toast } from '@/components/ui/toast';

export interface ApiResult<T=any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  raw: Response | null;
}

interface ApiOptions extends RequestInit {
  /** Pesan sukses otomatis (jika diset) */
  successMessage?: string;
  /** Jangan tampilkan toast error otomatis */
  silent?: boolean;
  /** Tampilkan toast processing sebelum request */
  processingMessage?: string;
  /** Custom validation handler */
  onValidationFail?: (data: any) => void;
}

function isJsonResponse(res: Response) {
  const ct = res.headers.get('content-type');
  return ct && ct.includes('application/json');
}

export function useApi(baseUrl = '') {
  const { push } = useToast();

  const request = useCallback(async <T=any>(url: string, opts: ApiOptions = {}): Promise<ApiResult<T>> => {
    const { successMessage, silent, processingMessage, onValidationFail, ...fetchOpts } = opts;
    let dismissedProcessingId: string | null = null;
    if (processingMessage) {
      // tampilkan info toast (durasi lebih panjang supaya tidak hilang terlalu cepat)
      // kita buat manual via push agar bisa dihapus nanti jika mau (improvement future)
      toast.info(push, processingMessage);
    }
    try {
      const res = await fetch(baseUrl + url, {
        ...fetchOpts,
        headers: {
          'Content-Type': 'application/json',
          ...(fetchOpts.headers || {})
        }
      });

      let data: any = undefined;
      if (isJsonResponse(res)) {
        try { data = await res.json(); } catch { /* ignore parse error */ }
      }

      if (!res.ok) {
        // Validation
        if (res.status === 400) {
          if (!silent) {
            const msg = (data && (data.error || data.message)) || 'Data tidak valid';
            toast.error(push, msg);
          }
          if (onValidationFail) onValidationFail(data);
          return { ok: false, status: res.status, data, error: data?.error, raw: res };
        }
        if (res.status === 401 || res.status === 403) {
          if (!silent) toast.error(push, 'Tidak memiliki akses');
          return { ok: false, status: res.status, data, error: 'unauthorized', raw: res };
        }
        if (!silent) {
          const msg = (data && (data.error || data.message)) || 'Terjadi kesalahan server';
            toast.error(push, msg);
        }
        return { ok: false, status: res.status, data, error: data?.error, raw: res };
      }

      if (successMessage && !silent) {
        toast.success(push, successMessage);
      }
      return { ok: true, status: res.status, data, raw: res };
    } catch (e: any) {
      if (!silent) toast.error(push, 'Koneksi bermasalah');
      return { ok: false, status: 0, error: e?.message || 'network error', raw: null };
    } finally {
      if (dismissedProcessingId) {
        // future: we could implement manual remove; sekarang biarkan auto dismiss
      }
    }
  }, [baseUrl, push]);

  const get = useCallback(<T=any>(url: string, opts?: ApiOptions) => request<T>(url, { method: 'GET', ...opts }), [request]);
  const post = useCallback(<T=any>(url: string, body?: any, opts?: ApiOptions) => request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...opts }), [request]);
  const put = useCallback(<T=any>(url: string, body?: any, opts?: ApiOptions) => request<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, ...opts }), [request]);
  const del = useCallback(<T=any>(url: string, opts?: ApiOptions) => request<T>(url, { method: 'DELETE', ...opts }), [request]);

  // Kembalikan objek yang dimemo agar referensi stabil antar render
  const apiObject = useMemo(() => ({ request, get, post, put, del }), [request, get, post, put, del]);
  return apiObject;
}
