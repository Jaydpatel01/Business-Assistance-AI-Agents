import { useState, useCallback } from 'react';
import { Scenario, CreateScenarioForm } from '@/lib/types';

interface UseScenariosReturn {
  scenarios: Scenario[];
  isLoading: boolean;
  error: string | null;
  createScenario: (data: CreateScenarioForm) => Promise<Scenario | null>;
  updateScenario: (id: string, data: Partial<CreateScenarioForm>) => Promise<Scenario | null>;
  deleteScenario: (id: string) => Promise<boolean>;
  fetchScenarios: () => Promise<void>;
  getScenario: (id: string) => Promise<Scenario | null>;
}

export function useScenarios(): UseScenariosReturn {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScenarios = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/scenarios');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch scenarios');
      }

      setScenarios(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Fetch scenarios error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createScenario = useCallback(async (data: CreateScenarioForm): Promise<Scenario | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create scenario');
      }

      const newScenario = result.data;
      setScenarios(prev => [newScenario, ...prev]);
      
      return newScenario;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Create scenario error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateScenario = useCallback(async (
    id: string, 
    data: Partial<CreateScenarioForm>
  ): Promise<Scenario | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/scenarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update scenario');
      }

      const updatedScenario = result.data;
      setScenarios(prev => 
        prev.map(scenario => 
          scenario.id === id ? updatedScenario : scenario
        )
      );
      
      return updatedScenario;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Update scenario error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteScenario = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/scenarios/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete scenario');
      }

      setScenarios(prev => prev.filter(scenario => scenario.id !== id));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Delete scenario error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getScenario = useCallback(async (id: string): Promise<Scenario | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/scenarios/${id}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch scenario');
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Get scenario error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    scenarios,
    isLoading,
    error,
    createScenario,
    updateScenario,
    deleteScenario,
    fetchScenarios,
    getScenario,
  };
}
