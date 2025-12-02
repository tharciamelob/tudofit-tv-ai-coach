import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  full_name?: string;
  height?: number;
  weight?: number;
  birth_date?: string;
  gender?: string;
  fitness_goal?: string;
}

export const useProfile = () => {
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfileData(data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const updateProfile = async (updates: ProfileData) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      // Formatar data corretamente se existir
      const formattedUpdates = {
        ...updates,
        birth_date: updates.birth_date 
          ? new Date(updates.birth_date).toISOString().split('T')[0] 
          : undefined,
      };

      // Remove campos undefined para não sobrescrever com null
      const cleanUpdates = Object.fromEntries(
        Object.entries(formattedUpdates).filter(([_, v]) => v !== undefined)
      );

      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            ...cleanUpdates,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      setProfileData(prev => ({ ...prev, ...cleanUpdates }));
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso!",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao atualizar",
        description: error?.message || "Não foi possível salvar as informações. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profileData,
    loading,
    updateProfile,
    refetch: fetchProfile
  };
};