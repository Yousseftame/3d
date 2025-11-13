import { useState, useEffect } from 'react';
import { FurnitureDefinition } from '@/types/furniture';

export const useFurnitureCatalog = () => {
  const [catalog, setCatalog] = useState<FurnitureDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const response = await fetch('/furniture-catalog.json');
        if (!response.ok) {
          throw new Error('Failed to load furniture catalog');
        }
        const data = await response.json();
        setCatalog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error loading furniture catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, []);

  return { catalog, loading, error };
};
