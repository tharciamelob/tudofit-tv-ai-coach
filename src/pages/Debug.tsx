'use client';
import React from 'react';
import { fetchCategoryExercises } from '@/hooks/useCategoryExercises';

export default function Debug() {
  const [rows, setRows] = React.useState<any[]>([]);
  const [err, setErr] = React.useState<string | null>(null);
  React.useEffect(() => {
    fetchCategoryExercises('crossfit', 5, 0).then(setRows).catch(e => setErr(e.message));
  }, []);
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Debug Crossfit</h1>
      {err && <p className="text-red-600">Erro: {err}</p>}
      <pre className="text-xs bg-gray-100 p-3 rounded">{JSON.stringify(rows, null, 2)}</pre>
    </div>
  );
}