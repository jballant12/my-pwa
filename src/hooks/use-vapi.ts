
import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

export function useVapi(apiKey: string) {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const vapiInstance = new Vapi(apiKey);
      setVapi(vapiInstance);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, [apiKey]);

  return { vapi, isLoading, error };
}
