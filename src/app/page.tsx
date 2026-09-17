import { ClientApp } from "@/components/ClientApp";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Home() {
  const catalog = await getCatalog().catch(() => ({ categories: [], products: [], version: "" }));
  return <ClientApp categories={catalog.categories} products={catalog.products} version={catalog.version} />;
}
