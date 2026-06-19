import { AppShell } from "@/components/shell/AppShell";
import { SimulateurCrypto } from "@/components/simulator/SimulateurCrypto";

export default function Home() {
  return (
    <AppShell>
      <SimulateurCrypto />
    </AppShell>
  );
}
