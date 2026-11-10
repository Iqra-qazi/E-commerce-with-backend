import { useCallback, useEffect, useState } from "react";
import { getProducts } from "../api/products";
import type { Product } from "../types/product";
import { getErrorMessage } from "../utils/errors";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getProducts(controller.signal)
      .then((items) => {
        setProducts(items);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(requestError, "Unable to load products."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [requestVersion]);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRequestVersion((version) => version + 1);
  }, []);

  return { products, loading, error, retry };
}
