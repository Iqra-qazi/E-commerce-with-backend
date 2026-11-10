import { useCallback, useEffect, useState } from "react";
import { getProductById, getProducts } from "../api/products";
import type { Product } from "../types/product";
import { getErrorMessage } from "../utils/errors";

type ProductState = {
  id: string;
  product: Product | null;
  loading: boolean;
  error: string | null;
};

export function useProduct(id: string | undefined) {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState<ProductState>({
    id: id ?? "",
    product: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!id) return;
    const productId = id;

    const controller = new AbortController();

    async function loadProduct() {
      try {
        const product = await getProductById(productId, controller.signal);
        if (!controller.signal.aborted) {
          setState({ id: productId, product, loading: false, error: null });
        }
      } catch (detailError) {
        if (controller.signal.aborted) return;

        try {
          const products = await getProducts(controller.signal);
          const product = products.find((item) => item._id === productId);
          if (!product) throw new Error("Product not found.");
          if (!controller.signal.aborted) {
            setState({ id: productId, product, loading: false, error: null });
          }
        } catch (listError) {
          if (!controller.signal.aborted) {
            const message =
              listError instanceof Error && listError.message === "Product not found."
                ? listError.message
                : getErrorMessage(listError, getErrorMessage(detailError, "Unable to load this product."));
            setState({ id: productId, product: null, loading: false, error: message });
          }
        }
      }
    }

    void loadProduct();
    return () => controller.abort();
  }, [id, requestVersion]);

  const retry = useCallback(() => {
    setState({ id: id ?? "", product: null, loading: true, error: null });
    setRequestVersion((version) => version + 1);
  }, [id]);

  const currentState = !id
    ? { id: "", product: null, loading: false, error: "Product not found." }
    : state.id === id
      ? state
      : { id, product: null, loading: true, error: null };

  return { ...currentState, retry };
}
