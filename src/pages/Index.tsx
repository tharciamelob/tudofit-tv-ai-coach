import { Link } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ContinueWatching from "@/components/ContinueWatching";
import WorkoutCarousel from "@/components/WorkoutCarousel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const Index = () => {
  const { user } = useAuth();
  const { loading: authLoading } = useAuthGuard();

  if (authLoading) {
    return <div>Carregando...</div>;
  }
  // Mock data for workout categories
  const workoutCategories = [
    {
      title: "Série para emagrecer rápido",
      workouts: [
        { id: "1", title: "HIIT Queima Gordura - 20 min", duration: "20 min", calories: "300 cal", difficulty: "Intermediário" as const, rating: 4.8, isNew: true },
        { id: "2", title: "Cardio Explosivo - Full Body", duration: "25 min", calories: "350 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "3", title: "Metabolismo Acelerado", duration: "15 min", calories: "250 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "4", title: "Fat Burn Express", duration: "30 min", calories: "400 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "5", title: "Cardio Dance Burn", duration: "35 min", calories: "420 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "6", title: "Tabata Intenso", duration: "12 min", calories: "200 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "7", title: "Circuit Training", duration: "28 min", calories: "380 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "8", title: "Kickboxing Cardio", duration: "40 min", calories: "500 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "9", title: "Step Aeróbico", duration: "30 min", calories: "320 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "10", title: "Spinning Virtual", duration: "45 min", calories: "550 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "11", title: "Zumba Fitness", duration: "35 min", calories: "400 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "12", title: "CrossFit WOD", duration: "25 min", calories: "350 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "13", title: "Aqua Aeróbica", duration: "40 min", calories: "280 cal", difficulty: "Iniciante" as const, rating: 4.4 },
        { id: "14", title: "Boot Camp", duration: "35 min", calories: "450 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "15", title: "Interval Training", duration: "20 min", calories: "300 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "16", title: "Cardio Boxe", duration: "30 min", calories: "380 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "17", title: "TRX Cardio", duration: "25 min", calories: "320 cal", difficulty: "Intermediário" as const, rating: 4.5 },
        { id: "18", title: "Battle Ropes", duration: "15 min", calories: "250 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "19", title: "Burpee Challenge", duration: "18 min", calories: "280 cal", difficulty: "Avançado" as const, rating: 4.6 },
        { id: "20", title: "Cardio Funcional", duration: "32 min", calories: "360 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "21", title: "EMOM Queima", duration: "20 min", calories: "300 cal", difficulty: "Intermediário" as const, rating: 4.5 },
        { id: "22", title: "Cardio Ladder", duration: "28 min", calories: "340 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "23", title: "Metabolic Finisher", duration: "12 min", calories: "180 cal", difficulty: "Avançado" as const, rating: 4.7 },
        { id: "24", title: "Fat Blaster Pro", duration: "35 min", calories: "450 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "25", title: "Cardio Recovery", duration: "25 min", calories: "200 cal", difficulty: "Iniciante" as const, rating: 4.4 }
      ]
    },
    {
      title: "CrossFit WODs",
      workouts: [
        { id: "cf1", title: "Fran - 21-15-9", duration: "8 min", calories: "180 cal", difficulty: "Avançado" as const, rating: 4.9, isNew: true },
        { id: "cf2", title: "Murph - Hero WOD", duration: "35 min", calories: "500 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "cf3", title: "Grace - 30 Clean & Jerk", duration: "6 min", calories: "150 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "cf4", title: "Cindy - 20min AMRAP", duration: "20 min", calories: "300 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "cf5", title: "Helen - 3 Rounds", duration: "12 min", calories: "220 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "cf6", title: "Diane - 21-15-9", duration: "10 min", calories: "200 cal", difficulty: "Avançado" as const, rating: 4.7 },
        { id: "cf7", title: "Annie - Double Unders", duration: "15 min", calories: "250 cal", difficulty: "Intermediário" as const, rating: 4.5 },
        { id: "cf8", title: "Kelly - 5 Rounds", duration: "25 min", calories: "350 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "cf9", title: "Jackie - For Time", duration: "8 min", calories: "180 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "cf10", title: "Lynne - Bodyweight", duration: "18 min", calories: "280 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "cf11", title: "Eva - Chipper", duration: "30 min", calories: "400 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "cf12", title: "Nancy - 5 Rounds", duration: "20 min", calories: "320 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "cf13", title: "Karen - Wall Balls", duration: "12 min", calories: "240 cal", difficulty: "Intermediário" as const, rating: 4.5 },
        { id: "cf14", title: "Isabel - Snatches", duration: "5 min", calories: "120 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "cf15", title: "Elizabeth - Clean & Ring Dips", duration: "15 min", calories: "260 cal", difficulty: "Avançado" as const, rating: 4.7 },
        { id: "cf16", title: "EMOM - Power", duration: "16 min", calories: "280 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "cf17", title: "Tabata This", duration: "20 min", calories: "300 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "cf18", title: "Fight Gone Bad", duration: "17 min", calories: "290 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "cf19", title: "Filthy Fifty", duration: "40 min", calories: "550 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "cf20", title: "The Seven", duration: "25 min", calories: "380 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "cf21", title: "Josh - Hero WOD", duration: "28 min", calories: "420 cal", difficulty: "Avançado" as const, rating: 4.7 },
        { id: "cf22", title: "Amanda - Muscle Ups", duration: "10 min", calories: "200 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "cf23", title: "Bear Complex", duration: "18 min", calories: "320 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "cf24", title: "Death By Burpees", duration: "15 min", calories: "270 cal", difficulty: "Intermediário" as const, rating: 4.5 },
        { id: "cf25", title: "Open WOD 23.1", duration: "14 min", calories: "250 cal", difficulty: "Intermediário" as const, rating: 4.7 }
      ]
    },
    {
      title: "Aulas de Jump",
      workouts: [
        { id: "jump1", title: "Jump Iniciante - Primeiros Pulos", duration: "20 min", calories: "200 cal", difficulty: "Iniciante" as const, rating: 4.6, isNew: true },
        { id: "jump2", title: "Jump Cardio Básico", duration: "25 min", calories: "250 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "jump3", title: "Jump Intermediário", duration: "30 min", calories: "320 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "jump4", title: "Jump Avançado Pro", duration: "35 min", calories: "400 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "jump5", title: "Jump Dance Mix", duration: "28 min", calories: "300 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "jump6", title: "Jump HIIT Intenso", duration: "25 min", calories: "350 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "jump7", title: "Jump Funcional", duration: "30 min", calories: "320 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "jump8", title: "Jump Queima Gordura", duration: "35 min", calories: "380 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "jump9", title: "Jump Fitness Mix", duration: "25 min", calories: "280 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "jump10", title: "Jump Power Training", duration: "40 min", calories: "450 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "jump11", title: "Jump Coreografia", duration: "30 min", calories: "300 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "jump12", title: "Jump Interval", duration: "22 min", calories: "260 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "jump13", title: "Jump Resistência", duration: "45 min", calories: "500 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "jump14", title: "Jump Express", duration: "15 min", calories: "180 cal", difficulty: "Iniciante" as const, rating: 4.4 },
        { id: "jump15", title: "Jump Coordination", duration: "28 min", calories: "290 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "jump16", title: "Jump Freestyle", duration: "32 min", calories: "340 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "jump17", title: "Jump Atletismo", duration: "35 min", calories: "380 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "jump18", title: "Jump Flexibilidade", duration: "25 min", calories: "220 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "jump19", title: "Jump Cross Training", duration: "30 min", calories: "320 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "jump20", title: "Jump Master Class", duration: "40 min", calories: "420 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "jump21", title: "Jump Wellness", duration: "20 min", calories: "200 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "jump22", title: "Jump Conditioning", duration: "35 min", calories: "380 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "jump23", title: "Jump Endurance", duration: "50 min", calories: "550 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "jump24", title: "Jump Recovery", duration: "18 min", calories: "160 cal", difficulty: "Iniciante" as const, rating: 4.4 },
        { id: "jump25", title: "Jump Championship", duration: "42 min", calories: "480 cal", difficulty: "Avançado" as const, rating: 4.9 }
      ]
    },
    {
      title: "Séries de Academia - Iniciantes",
      workouts: [
        { id: "17", title: "Primeiro Treino na Academia", duration: "30 min", calories: "150 cal", difficulty: "Iniciante" as const, rating: 4.9, isNew: true },
        { id: "18", title: "Básico de Musculação - Semana 1", duration: "40 min", calories: "180 cal", difficulty: "Iniciante" as const, rating: 4.8 },
        { id: "19", title: "Adaptação Corporal", duration: "35 min", calories: "160 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "20", title: "Fundamentos da Musculação", duration: "45 min", calories: "200 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "gym1", title: "Treino A - Peito e Tríceps", duration: "35 min", calories: "170 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "gym2", title: "Treino B - Costas e Bíceps", duration: "40 min", calories: "180 cal", difficulty: "Iniciante" as const, rating: 4.8 },
        { id: "gym3", title: "Treino C - Pernas e Glúteos", duration: "45 min", calories: "200 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "gym4", title: "Upper Body Iniciante", duration: "35 min", calories: "160 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "gym5", title: "Lower Body Iniciante", duration: "40 min", calories: "180 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "gym6", title: "Full Body Máquinas", duration: "50 min", calories: "220 cal", difficulty: "Iniciante" as const, rating: 4.8 },
        { id: "gym7", title: "Cardio + Musculação", duration: "45 min", calories: "250 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "gym8", title: "Postura e Movimento", duration: "30 min", calories: "140 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "gym9", title: "Força Base", duration: "40 min", calories: "170 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "gym10", title: "Coordenação Motora", duration: "35 min", calories: "150 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "gym11", title: "Mobilidade Articular", duration: "25 min", calories: "100 cal", difficulty: "Iniciante" as const, rating: 4.8 },
        { id: "gym12", title: "Equilíbrio Muscular", duration: "40 min", calories: "180 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "gym13", title: "Introdução ao Peso Livre", duration: "35 min", calories: "160 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "gym14", title: "Treino de Adaptação", duration: "30 min", calories: "140 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "gym15", title: "Circuito Iniciante", duration: "35 min", calories: "170 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "gym16", title: "Resistência Muscular", duration: "40 min", calories: "180 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "gym17", title: "Core Stability", duration: "25 min", calories: "120 cal", difficulty: "Iniciante" as const, rating: 4.8 },
        { id: "gym18", title: "Movimento Funcional", duration: "30 min", calories: "150 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "gym19", title: "Técnica de Execução", duration: "35 min", calories: "160 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "gym20", title: "Treino Supervisionado", duration: "45 min", calories: "200 cal", difficulty: "Iniciante" as const, rating: 4.8 },
        { id: "gym21", title: "Base Muscular", duration: "40 min", calories: "180 cal", difficulty: "Iniciante" as const, rating: 4.6 }
      ]
    },
    {
      title: "Séries de Academia - Condicionamento",
      workouts: [
        { id: "21", title: "Resistência Cardiovascular", duration: "50 min", calories: "400 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "22", title: "Circuito Funcional Academia", duration: "45 min", calories: "350 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "23", title: "Crossfit Style na Academia", duration: "40 min", calories: "450 cal", difficulty: "Avançado" as const, rating: 4.9, isNew: true },
        { id: "24", title: "Condicionamento Atlético", duration: "55 min", calories: "500 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "cond1", title: "HIIT com Pesos", duration: "35 min", calories: "380 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "cond2", title: "Tabata Strength", duration: "25 min", calories: "300 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "cond3", title: "Circuit Power", duration: "40 min", calories: "420 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "cond4", title: "Metabolic Training", duration: "45 min", calories: "480 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "cond5", title: "Cardio Strength Mix", duration: "50 min", calories: "450 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "cond6", title: "Endurance Builder", duration: "60 min", calories: "550 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "cond7", title: "Complex Training", duration: "40 min", calories: "400 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "cond8", title: "Athletic Performance", duration: "55 min", calories: "520 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "cond9", title: "Functional Strength", duration: "45 min", calories: "430 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "cond10", title: "Power Conditioning", duration: "35 min", calories: "380 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "cond11", title: "Interval Strength", duration: "40 min", calories: "410 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "cond12", title: "Combat Conditioning", duration: "45 min", calories: "460 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "cond13", title: "Agility Training", duration: "35 min", calories: "350 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "cond14", title: "Explosive Movement", duration: "30 min", calories: "330 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "cond15", title: "Cardio Resistance", duration: "50 min", calories: "470 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "cond16", title: "High Intensity Circuit", duration: "40 min", calories: "440 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "cond17", title: "Total Body Conditioning", duration: "55 min", calories: "510 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "cond18", title: "Speed & Power", duration: "35 min", calories: "370 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "cond19", title: "Stamina Builder", duration: "45 min", calories: "450 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "cond20", title: "Elite Conditioning", duration: "60 min", calories: "580 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "cond21", title: "Recovery Conditioning", duration: "30 min", calories: "250 cal", difficulty: "Iniciante" as const, rating: 4.5 }
      ]
    },
    {
      title: "Séries de Academia - Fisiculturismo",
      workouts: [
        { id: "25", title: "Peito e Tríceps - Bodybuilding", duration: "60 min", calories: "250 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "26", title: "Costas e Bíceps - Pro", duration: "70 min", calories: "280 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "27", title: "Pernas - Hipertrofia Máxima", duration: "65 min", calories: "300 cal", difficulty: "Avançado" as const, rating: 4.9, isNew: true },
        { id: "28", title: "Ombros e Trapézio - Definition", duration: "50 min", calories: "200 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "bb1", title: "Peito - Volume Máximo", duration: "55 min", calories: "230 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "bb2", title: "Costas - Largura e Espessura", duration: "65 min", calories: "270 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "bb3", title: "Quadríceps - Mass Builder", duration: "60 min", calories: "280 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "bb4", title: "Ombros - 3D Development", duration: "50 min", calories: "210 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "bb5", title: "Bíceps e Tríceps - Arms Day", duration: "45 min", calories: "180 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "bb6", title: "Posterior Chain", duration: "55 min", calories: "250 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "bb7", title: "Push Day - Peito/Ombro/Tríceps", duration: "70 min", calories: "290 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "bb8", title: "Pull Day - Costas/Bíceps", duration: "65 min", calories: "280 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "bb9", title: "Leg Day - Completo", duration: "75 min", calories: "320 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "bb10", title: "Upper Body Hypertrophy", duration: "60 min", calories: "260 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "bb11", title: "Lower Body Mass", duration: "65 min", calories: "290 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "bb12", title: "Chest Specialization", duration: "50 min", calories: "220 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "bb13", title: "Back Width Focus", duration: "55 min", calories: "240 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "bb14", title: "Shoulder Sculpting", duration: "45 min", calories: "190 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "bb15", title: "Arm Pump Session", duration: "40 min", calories: "170 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "bb16", title: "Quad Destroyer", duration: "55 min", calories: "270 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "bb17", title: "Glute Builder", duration: "50 min", calories: "230 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "bb18", title: "Definition Cut", duration: "45 min", calories: "200 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "bb19", title: "Mass Gainer Protocol", duration: "70 min", calories: "300 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "bb20", title: "Symmetry Builder", duration: "60 min", calories: "250 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "bb21", title: "Competition Prep", duration: "65 min", calories: "280 cal", difficulty: "Avançado" as const, rating: 4.8 }
      ]
    },
    {
      title: "Série para ganho de massa muscular",
      workouts: [
        { id: "5", title: "Hipertrofia Peito e Tríceps", duration: "45 min", calories: "200 cal", difficulty: "Intermediário" as const, rating: 4.9 },
        { id: "6", title: "Costas e Bíceps - Massa", duration: "50 min", calories: "220 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "7", title: "Pernas e Glúteos - Power", duration: "40 min", calories: "180 cal", difficulty: "Intermediário" as const, rating: 4.7, isNew: true },
        { id: "8", title: "Ombros e Trapézio", duration: "35 min", calories: "150 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "mass1", title: "Upper Body Hypertrophy", duration: "55 min", calories: "240 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "mass2", title: "Lower Body Mass", duration: "60 min", calories: "280 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "mass3", title: "Push Workout - Volume", duration: "50 min", calories: "220 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "mass4", title: "Pull Workout - Densidade", duration: "55 min", calories: "250 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "mass5", title: "Leg Day - Mass Builder", duration: "65 min", calories: "300 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "mass6", title: "Full Body Strength", duration: "45 min", calories: "200 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "mass7", title: "Compound Movements", duration: "50 min", calories: "230 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "mass8", title: "Isolation Focus", duration: "40 min", calories: "180 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "mass9", title: "Progressive Overload", duration: "55 min", calories: "250 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "mass10", title: "Volume Training", duration: "60 min", calories: "270 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "mass11", title: "Strength & Size", duration: "50 min", calories: "220 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "mass12", title: "Mass Protocol", duration: "65 min", calories: "290 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "mass13", title: "Bulking Workout", duration: "55 min", calories: "240 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "mass14", title: "Power Building", duration: "50 min", calories: "230 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "mass15", title: "Muscle Activation", duration: "35 min", calories: "160 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "mass16", title: "Time Under Tension", duration: "45 min", calories: "200 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "mass17", title: "Heavy Lifting Day", duration: "60 min", calories: "280 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "mass18", title: "Muscle Building Basics", duration: "40 min", calories: "180 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "mass19", title: "Size & Strength Combo", duration: "55 min", calories: "250 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "mass20", title: "Mass Gain Circuit", duration: "50 min", calories: "220 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "mass21", title: "Hypertrophy Finisher", duration: "30 min", calories: "140 cal", difficulty: "Iniciante" as const, rating: 4.4 }
      ]
    },
    {
      title: "Treinos em Casa - Sem Equipamento",
      workouts: [
        { id: "13", title: "Home Workout - Sem Equipamentos", duration: "30 min", calories: "200 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "14", title: "Sala de Casa - Condicionamento", duration: "25 min", calories: "180 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "15", title: "Apartamento Friendly", duration: "20 min", calories: "150 cal", difficulty: "Iniciante" as const, rating: 4.8, isNew: true },
        { id: "16", title: "Home HIIT Intenso", duration: "35 min", calories: "280 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "29", title: "Peso Corporal - Full Body", duration: "40 min", calories: "250 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "30", title: "Calistenia Básica", duration: "35 min", calories: "220 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "home1", title: "Morning Energy Boost", duration: "15 min", calories: "120 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "home2", title: "Living Room Cardio", duration: "25 min", calories: "200 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "home3", title: "No Jump Workout", duration: "30 min", calories: "180 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "home4", title: "Core & Glutes Focus", duration: "20 min", calories: "140 cal", difficulty: "Iniciante" as const, rating: 4.8 },
        { id: "home5", title: "Upper Body Blaster", duration: "25 min", calories: "160 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "home6", title: "Lower Body Burn", duration: "30 min", calories: "200 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "home7", title: "Total Body Strength", duration: "35 min", calories: "220 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "home8", title: "Quick Morning Routine", duration: "12 min", calories: "100 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "home9", title: "Evening Wind Down", duration: "20 min", calories: "120 cal", difficulty: "Iniciante" as const, rating: 4.4 },
        { id: "home10", title: "High Energy Flow", duration: "28 min", calories: "210 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "home11", title: "Bodyweight Challenge", duration: "40 min", calories: "280 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "home12", title: "Flexibility & Strength", duration: "35 min", calories: "180 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "home13", title: "Apartment HIIT", duration: "22 min", calories: "180 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "home14", title: "Silent Workout", duration: "25 min", calories: "160 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "home15", title: "Power Flow", duration: "30 min", calories: "220 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "home16", title: "Beginner Friendly", duration: "18 min", calories: "130 cal", difficulty: "Iniciante" as const, rating: 4.4 },
        { id: "home17", title: "Advanced Bodyweight", duration: "45 min", calories: "320 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "home18", title: "Recovery Flow", duration: "20 min", calories: "100 cal", difficulty: "Iniciante" as const, rating: 4.3 },
        { id: "home19", title: "Weekend Energizer", duration: "35 min", calories: "240 cal", difficulty: "Intermediário" as const, rating: 4.7 }
      ]
    },
    {
      title: "Treinos Pilates - Sem Equipamentos",
      workouts: [
        { id: "36", title: "Pilates Básico - Mat Work", duration: "30 min", calories: "120 cal", difficulty: "Iniciante" as const, rating: 4.8 },
        { id: "37", title: "Core Pilates - Fortalecimento", duration: "25 min", calories: "100 cal", difficulty: "Intermediário" as const, rating: 4.9, isNew: true },
        { id: "38", title: "Pilates Postural", duration: "35 min", calories: "130 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "39", title: "Pilates Flow - Sequência Completa", duration: "40 min", calories: "150 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "40", title: "Pilates Respiração e Movimento", duration: "20 min", calories: "80 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "pil1", title: "Pilates Morning Routine", duration: "25 min", calories: "110 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "pil2", title: "Advanced Pilates Flow", duration: "45 min", calories: "180 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "pil3", title: "Pilates Flexibility", duration: "30 min", calories: "120 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "pil4", title: "Core Stability Focus", duration: "28 min", calories: "115 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "pil5", title: "Pilates Strength Builder", duration: "35 min", calories: "140 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "pil6", title: "Gentle Pilates Recovery", duration: "20 min", calories: "85 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "pil7", title: "Power Pilates Session", duration: "40 min", calories: "160 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "pil8", title: "Pilates Balance & Control", duration: "32 min", calories: "125 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "pil9", title: "Classical Pilates", duration: "35 min", calories: "135 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "pil10", title: "Pilates for Beginners", duration: "25 min", calories: "100 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "pil11", title: "Dynamic Pilates Flow", duration: "38 min", calories: "145 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "pil12", title: "Pilates Sculpt", duration: "30 min", calories: "130 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "pil13", title: "Pilates Evening Stretch", duration: "22 min", calories: "90 cal", difficulty: "Iniciante" as const, rating: 4.4 },
        { id: "pil14", title: "Total Body Pilates", duration: "42 min", calories: "165 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "pil15", title: "Pilates Quick Fix", duration: "15 min", calories: "70 cal", difficulty: "Iniciante" as const, rating: 4.3 },
        { id: "pil16", title: "Intermediate Mat Pilates", duration: "35 min", calories: "140 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "pil17", title: "Pilates Precision", duration: "28 min", calories: "115 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "pil18", title: "Mindful Pilates Practice", duration: "30 min", calories: "120 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "pil19", title: "Pilates Athletic Flow", duration: "40 min", calories: "155 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "pil20", title: "Restorative Pilates", duration: "25 min", calories: "95 cal", difficulty: "Iniciante" as const, rating: 4.4 }
      ]
    },
    {
      title: "Treinos Yoga",
      workouts: [
        { id: "41", title: "Hatha Yoga para Iniciantes", duration: "30 min", calories: "90 cal", difficulty: "Iniciante" as const, rating: 4.8 },
        { id: "42", title: "Vinyasa Flow - Energia", duration: "45 min", calories: "140 cal", difficulty: "Intermediário" as const, rating: 4.9 },
        { id: "43", title: "Yoga Matinal - Desperte", duration: "20 min", calories: "70 cal", difficulty: "Iniciante" as const, rating: 4.7, isNew: true },
        { id: "44", title: "Yin Yoga - Relaxamento", duration: "50 min", calories: "60 cal", difficulty: "Iniciante" as const, rating: 4.8 },
        { id: "45", title: "Power Yoga - Força e Flexibilidade", duration: "40 min", calories: "180 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "46", title: "Yoga Noturno - Sono Reparador", duration: "25 min", calories: "50 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "yoga1", title: "Ashtanga Primary Series", duration: "60 min", calories: "220 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "yoga2", title: "Gentle Yoga Flow", duration: "30 min", calories: "85 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "yoga3", title: "Hot Yoga Session", duration: "45 min", calories: "200 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "yoga4", title: "Restorative Yoga", duration: "35 min", calories: "55 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "yoga5", title: "Yoga for Flexibility", duration: "40 min", calories: "110 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "yoga6", title: "Core Yoga Flow", duration: "25 min", calories: "95 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "yoga7", title: "Kundalini Awakening", duration: "50 min", calories: "130 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "yoga8", title: "Chair Yoga - Office", duration: "15 min", calories: "40 cal", difficulty: "Iniciante" as const, rating: 4.3 },
        { id: "yoga9", title: "Yoga for Athletes", duration: "35 min", calories: "120 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "yoga10", title: "Meditation & Movement", duration: "45 min", calories: "80 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "yoga11", title: "Advanced Vinyasa", duration: "50 min", calories: "190 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "yoga12", title: "Prenatal Yoga", duration: "30 min", calories: "75 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "yoga13", title: "Hip Opening Flow", duration: "35 min", calories: "105 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "yoga14", title: "Backbend Practice", duration: "30 min", calories: "100 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "yoga15", title: "Yoga Nidra - Deep Rest", duration: "40 min", calories: "30 cal", difficulty: "Iniciante" as const, rating: 4.8 },
        { id: "yoga16", title: "Sun Salutation Flow", duration: "20 min", calories: "85 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "yoga17", title: "Balance & Strength", duration: "35 min", calories: "115 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "yoga18", title: "Yoga for Stress Relief", duration: "25 min", calories: "65 cal", difficulty: "Iniciante" as const, rating: 4.4 },
        { id: "yoga19", title: "Therapeutic Yoga", duration: "40 min", calories: "70 cal", difficulty: "Iniciante" as const, rating: 4.6 }
      ]
    },
    {
      title: "Funcional de 15 minutos",
      workouts: [
        { id: "9", title: "Quick Core Blast", duration: "15 min", calories: "120 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "10", title: "Express Full Body", duration: "15 min", calories: "140 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "11", title: "Mobilidade Matinal", duration: "15 min", calories: "80 cal", difficulty: "Iniciante" as const, rating: 4.8, isNew: true },
        { id: "12", title: "Power 15 - Força", duration: "15 min", calories: "160 cal", difficulty: "Avançado" as const, rating: 4.5 },
        { id: "func1", title: "Morning Energizer", duration: "15 min", calories: "130 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "func2", title: "Lunch Break Boost", duration: "15 min", calories: "120 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "func3", title: "Upper Body Quick", duration: "15 min", calories: "110 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "func4", title: "Lower Body Burn", duration: "15 min", calories: "140 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "func5", title: "Cardio Blast 15", duration: "15 min", calories: "150 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "func6", title: "Strength Snap", duration: "15 min", calories: "125 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "func7", title: "HIIT Express", duration: "15 min", calories: "170 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "func8", title: "Flexibility Flow", duration: "15 min", calories: "70 cal", difficulty: "Iniciante" as const, rating: 4.4 },
        { id: "func9", title: "Power Circuit", duration: "15 min", calories: "155 cal", difficulty: "Avançado" as const, rating: 4.7 },
        { id: "func10", title: "Balance & Core", duration: "15 min", calories: "100 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "func11", title: "Quick Tone Up", duration: "15 min", calories: "115 cal", difficulty: "Intermediário" as const, rating: 4.5 },
        { id: "func12", title: "Energy Booster", duration: "15 min", calories: "135 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "func13", title: "Functional Flow", duration: "15 min", calories: "120 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "func14", title: "Wake Up Workout", duration: "15 min", calories: "110 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "func15", title: "Metabolic Boost", duration: "15 min", calories: "145 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "func16", title: "Quick Shred", duration: "15 min", calories: "160 cal", difficulty: "Avançado" as const, rating: 4.7 },
        { id: "func17", title: "Daily Movement", duration: "15 min", calories: "90 cal", difficulty: "Iniciante" as const, rating: 4.4 },
        { id: "func18", title: "Posture Fix", duration: "15 min", calories: "85 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "func19", title: "Quick Recovery", duration: "15 min", calories: "70 cal", difficulty: "Iniciante" as const, rating: 4.3 },
        { id: "func20", title: "Power Start", duration: "15 min", calories: "140 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "func21", title: "Express Challenge", duration: "15 min", calories: "165 cal", difficulty: "Avançado" as const, rating: 4.8 }
      ]
    },
    {
      title: "Calistenia",
      workouts: [
        { id: "calistenia1", title: "Calistenia Básica - Fundamentos", duration: "25 min", calories: "200 cal", difficulty: "Iniciante" as const, rating: 4.7 },
        { id: "calistenia2", title: "Flexões e Variações", duration: "20 min", calories: "180 cal", difficulty: "Iniciante" as const, rating: 4.8 },
        { id: "calistenia3", title: "Barras e Pull-ups", duration: "30 min", calories: "250 cal", difficulty: "Intermediário" as const, rating: 4.9 },
        { id: "calistenia4", title: "Handstand e Equilíbrios", duration: "35 min", calories: "220 cal", difficulty: "Avançado" as const, rating: 4.6 },
        { id: "calistenia5", title: "Treino de Força Completo", duration: "45 min", calories: "320 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "calistenia6", title: "Muscle-ups e Movimentos Avançados", duration: "40 min", calories: "350 cal", difficulty: "Avançado" as const, rating: 4.7 },
        { id: "cal1", title: "Street Workout Basics", duration: "30 min", calories: "240 cal", difficulty: "Iniciante" as const, rating: 4.6 },
        { id: "cal2", title: "Human Flag Progression", duration: "25 min", calories: "200 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "cal3", title: "Pistol Squat Training", duration: "20 min", calories: "160 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "cal4", title: "Front Lever Progression", duration: "30 min", calories: "220 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "cal5", title: "Parallel Bars Workout", duration: "35 min", calories: "280 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "cal6", title: "Bodyweight Upper Body", duration: "40 min", calories: "300 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "cal7", title: "Plyometric Calisthenics", duration: "25 min", calories: "220 cal", difficulty: "Avançado" as const, rating: 4.7 },
        { id: "cal8", title: "Core Calisthenics", duration: "20 min", calories: "150 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "cal9", title: "Advanced Skills Training", duration: "50 min", calories: "380 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "cal10", title: "Beginner Bodyweight", duration: "25 min", calories: "180 cal", difficulty: "Iniciante" as const, rating: 4.4 },
        { id: "cal11", title: "Ring Training Basics", duration: "35 min", calories: "260 cal", difficulty: "Intermediário" as const, rating: 4.8 },
        { id: "cal12", title: "Isometric Holds", duration: "20 min", calories: "140 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "cal13", title: "Dynamic Movement Flow", duration: "30 min", calories: "240 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "cal14", title: "Power Calisthenics", duration: "35 min", calories: "290 cal", difficulty: "Avançado" as const, rating: 4.8 },
        { id: "cal15", title: "Flexibility for Calisthenics", duration: "25 min", calories: "120 cal", difficulty: "Iniciante" as const, rating: 4.5 },
        { id: "cal16", title: "Competition Preparation", duration: "45 min", calories: "340 cal", difficulty: "Avançado" as const, rating: 4.9 },
        { id: "cal17", title: "Strength Endurance", duration: "40 min", calories: "310 cal", difficulty: "Intermediário" as const, rating: 4.7 },
        { id: "cal18", title: "Bodyweight Cardio", duration: "30 min", calories: "250 cal", difficulty: "Intermediário" as const, rating: 4.6 },
        { id: "cal19", title: "Advanced Transitions", duration: "35 min", calories: "280 cal", difficulty: "Avançado" as const, rating: 4.8 }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black app-container">
      <Header />
      
      <div className="pt-20">
        <HeroSection />
        <ContinueWatching />
        
        {/* Hero Section with CTA for non-logged users */}
        {!user && (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Comece sua jornada fitness hoje!</h2>
              <p className="text-muted-foreground mb-6">
                Acesse sua conta para desbloquear treinos personalizados, cardápios IA e muito mais.
              </p>
              <Link to="/auth">
                <Button size="lg" className="btn-hero">
                  Entrar / Cadastrar - R$ 9,99 primeiro mês
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        {/* Workout Categories */}
        <div className="pb-8">
          {workoutCategories.map((category, index) => (
            <WorkoutCarousel
              key={index}
              title={category.title}
              workouts={category.workouts}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
