import { Sidebar } from "./sidebar";
import { Header } from "./header";

type AppShellProps = {
  children: React.ReactNode;
  onNewCharacter?: () => void;
};

export function AppShell({ children, onNewCharacter }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onNewCharacter={onNewCharacter} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
