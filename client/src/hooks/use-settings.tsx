import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

interface UserSettings {
  id: string;
  userId: string;
  userName: string;
  dailyFocus: string;
  quickNotes: string;
  backgroundImage: string;
  panelVisibility: string;
  showDummyData: boolean;
}

interface SettingsContextType {
  settings: UserSettings | undefined;
  showDummyData: boolean;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  const settings = data as UserSettings | undefined;
  const showDummyData = settings?.showDummyData ?? true;

  return (
    <SettingsContext.Provider value={{ settings, showDummyData, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}