import type { Metadata } from "next";
import { SimulateurCrypto } from "@/components/simulator/SimulateurCrypto";

export const metadata: Metadata = {
  title: "Simulateur Plus-Value Crypto",
  robots: { index: false, follow: false },
};

/**
 * Version embarquable (sans le shell de la suite), destinée à être intégrée
 * via <iframe> depuis sinvestir.fr. Autonome, peu de dépendances.
 */
export default function EmbedPage() {
  return (
    <div className="px-4 py-8 sm:px-6">
      <SimulateurCrypto embedded />
    </div>
  );
}
