export const useApi = () => {
  const apiBase = "/api";

  const request = async <T>(
    path: string,
    options?: Parameters<typeof $fetch>[1],
  ): Promise<T> => {
    try {
      return await $fetch<T>(`${apiBase}${path}`, {
        credentials: "include",
        ...options,
      });
    } catch (err: unknown) {
      const fetchErr = err as { data?: { message?: string }; message?: string };
      const message =
        fetchErr?.data?.message || fetchErr?.message || "Erro de conexão";
      throw new Error(message);
    }
  };

  const get = <T>(path: string) => request<T>(path);

  const requestBody = (body?: unknown) =>
    body as Record<string, unknown> | BodyInit | null | undefined;

  const post = <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: requestBody(body) });

  const put = <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: requestBody(body) });

  const patch = <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: requestBody(body) });

  const del = <T>(path: string) => request<T>(path, { method: "DELETE" });

  return { get, post, put, patch, del };
};
