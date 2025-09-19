import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfile } from '@/hooks/useProfile';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditModal = ({ isOpen, onClose }: ProfileEditModalProps) => {
  const { profileData, updateProfile, loading } = useProfile();
  const [formData, setFormData] = useState({
    full_name: '',
    height: '',
    weight: '',
    birth_date: '',
    gender: '',
    fitness_goal: '',
  });

  // Update form data when profileData changes
  useEffect(() => {
    setFormData({
      full_name: profileData.full_name || '',
      height: profileData.height?.toString() || '',
      weight: profileData.weight?.toString() || '',
      birth_date: profileData.birth_date || '',
      gender: profileData.gender || '',
      fitness_goal: profileData.fitness_goal || '',
    });
  }, [profileData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      full_name: formData.full_name.trim() || undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      birth_date: formData.birth_date || undefined,
      gender: formData.gender || undefined,
      fitness_goal: formData.fitness_goal || undefined,
    };

    const success = await updateProfile(updates);
    if (success) {
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Informações Pessoais</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="175"
              />
            </div>
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="70"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="birth_date">Data de Nascimento</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => handleInputChange('birth_date', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="gender">Sexo</Label>
            <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="fitness_goal">Objetivo Fitness</Label>
            <Select value={formData.fitness_goal} onValueChange={(value) => handleInputChange('fitness_goal', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perder_peso">Perder Peso</SelectItem>
                <SelectItem value="ganhar_massa">Ganhar Massa Muscular</SelectItem>
                <SelectItem value="manter_peso">Manter Peso</SelectItem>
                <SelectItem value="melhorar_condicionamento">Melhorar Condicionamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};