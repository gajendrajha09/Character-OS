import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { TopBar } from "./top-bar";

type AppShellProps = {
  children: React.ReactNode;
  onNewCharacter?: () => void;
};

export function AppShell({ children, onNewCharacter }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface">
      <TopBar active="studio" />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onNewCharacter={onNewCharacter} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
