import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportExercises } from '@/components/ImportExercises';
import { AutoMatchExercises } from '@/components/AutoMatchExercises';
import { ExerciseList } from '@/components/ExerciseList';
import { Upload, Search, List } from 'lucide-react';

const AdminExercises = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Administração de Exercícios</h1>
          <p className="text-gray-600">Gerencie a biblioteca de exercícios do TudoFit TV</p>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar CSV
            </TabsTrigger>
            <TabsTrigger value="match" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Match Automático
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Exercícios</CardTitle>
              </CardHeader>
              <CardContent>
                <ExerciseList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>Importar Exercícios via CSV</CardTitle>
              </CardHeader>
              <CardContent>
                <ImportExercises />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="match">
            <Card>
              <CardHeader>
                <CardTitle>Match Automático de Arquivos</CardTitle>
              </CardHeader>
              <CardContent>
                <AutoMatchExercises />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminExercises;