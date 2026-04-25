import { API_ENDPOINTS, API_URL } from "./config";
import { apiFetchWithRefresh } from "./client";

export type ExportKind = "products" | "orders";
export type ExportFormat = "json" | "csv";

const endpointByKind: Record<ExportKind, string> = {
  products: API_ENDPOINTS.exportProducts,
  orders: API_ENDPOINTS.exportOrders,
};

const getFilename = (response: Response, kind: ExportKind, format: ExportFormat) => {
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="([^"]+)"/);
  return match?.[1] || `flowerboom-${kind}-${new Date().toISOString().slice(0, 10)}.${format}`;
};

export const adminExportApi = {
  async download(kind: ExportKind, format: ExportFormat) {
    const response = await apiFetchWithRefresh(`${API_URL}${endpointByKind[kind]}?format=${format}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Ошибка экспорта" }));
      throw new Error(error.error || error.message || "Ошибка экспорта");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getFilename(response, kind, format);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
