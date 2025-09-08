import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  Transaction,
  MonthlySummary,
  FinancialSummary,
} from "../expense-tracker/types";

// Types for user data management
export interface UserDataset {
  id: string;
  name: string;
  fileName: string;
  uploadedAt: string;
  transactions: Transaction[];
  monthlyData: MonthlySummary[];
  summary: FinancialSummary | null;
  isActive: boolean; // Currently selected dataset
}

export interface UserDataState {
  datasets: UserDataset[];
  activeDataset: UserDataset | null;
  isLoading: boolean;
}

export interface UserDataContextType extends UserDataState {
  addDataset: (
    name: string,
    fileName: string,
    transactions: Transaction[],
    monthlyData: MonthlySummary[],
    summary: FinancialSummary
  ) => void;
  setActiveDataset: (datasetId: string) => void;
  removeDataset: (datasetId: string) => void;
  clearAllData: () => void;
  updateDatasetName: (datasetId: string, newName: string) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
}

// Local storage keys (will be replaced with API calls when auth is implemented)
const STORAGE_KEY = "expense-tracker-datasets";

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [userDataState, setUserDataState] = useState<UserDataState>({
    datasets: [],
    activeDataset: null,
    isLoading: true,
  });

  // Load data from localStorage on mount (future: load from API)
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const datasets: UserDataset[] = JSON.parse(stored);
          const activeDataset = datasets.find((d) => d.isActive) || null;

          setUserDataState({
            datasets,
            activeDataset,
            isLoading: false,
          });
        } else {
          setUserDataState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setUserDataState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadData();
  }, []);

  // Save to localStorage whenever datasets change (future: sync with API)
  const saveData = (datasets: UserDataset[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datasets));
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  const addDataset = (
    name: string,
    fileName: string,
    transactions: Transaction[],
    monthlyData: MonthlySummary[],
    summary: FinancialSummary
  ) => {
    const newDataset: UserDataset = {
      id: `dataset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      fileName,
      uploadedAt: new Date().toISOString(),
      transactions,
      monthlyData,
      summary,
      isActive: true, // New dataset becomes active
    };

    setUserDataState((prev) => {
      // Deactivate all other datasets
      const updatedDatasets = prev.datasets.map((d) => ({
        ...d,
        isActive: false,
      }));
      const newDatasets = [...updatedDatasets, newDataset];

      saveData(newDatasets);

      return {
        datasets: newDatasets,
        activeDataset: newDataset,
        isLoading: false,
      };
    });
  };

  const setActiveDataset = (datasetId: string) => {
    setUserDataState((prev) => {
      const updatedDatasets = prev.datasets.map((d) => ({
        ...d,
        isActive: d.id === datasetId,
      }));

      const activeDataset = updatedDatasets.find((d) => d.isActive) || null;

      saveData(updatedDatasets);

      return {
        ...prev,
        datasets: updatedDatasets,
        activeDataset,
      };
    });
  };

  const removeDataset = (datasetId: string) => {
    setUserDataState((prev) => {
      const updatedDatasets = prev.datasets.filter((d) => d.id !== datasetId);

      // If we removed the active dataset, make the first one active (if any)
      let activeDataset = prev.activeDataset;
      if (prev.activeDataset?.id === datasetId) {
        if (updatedDatasets.length > 0) {
          updatedDatasets[0].isActive = true;
          activeDataset = updatedDatasets[0];
        } else {
          activeDataset = null;
        }
      }

      saveData(updatedDatasets);

      return {
        ...prev,
        datasets: updatedDatasets,
        activeDataset,
      };
    });
  };

  const clearAllData = () => {
    setUserDataState({
      datasets: [],
      activeDataset: null,
      isLoading: false,
    });

    localStorage.removeItem(STORAGE_KEY);
  };

  const updateDatasetName = (datasetId: string, newName: string) => {
    setUserDataState((prev) => {
      const updatedDatasets = prev.datasets.map((d) =>
        d.id === datasetId ? { ...d, name: newName } : d
      );

      const activeDataset =
        prev.activeDataset?.id === datasetId
          ? { ...prev.activeDataset, name: newName }
          : prev.activeDataset;

      saveData(updatedDatasets);

      return {
        ...prev,
        datasets: updatedDatasets,
        activeDataset,
      };
    });
  };

  const value: UserDataContextType = {
    ...userDataState,
    addDataset,
    setActiveDataset,
    removeDataset,
    clearAllData,
    updateDatasetName,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}
