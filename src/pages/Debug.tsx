import { useEffect, useState } from 'react';
import { fetchCategoryExercises, CategoryExercise } from '@/hooks/useCategoryExercises';

const Debug = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoryExercises('crossfit', 10, 0)
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Debug Crossfit</h1>
      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-600">Erro: {error}</p>}
      {!loading && !error && (
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify(rows, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default Debug;