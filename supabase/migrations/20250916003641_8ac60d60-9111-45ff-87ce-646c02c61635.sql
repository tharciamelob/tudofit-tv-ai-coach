-- Corrigir a função calc_sleep_duration para usar os nomes corretos dos campos
CREATE OR REPLACE FUNCTION public.calc_sleep_duration()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.bedtime IS NOT NULL AND NEW.wake_time IS NOT NULL THEN
    -- Calcular duração do sono em minutos
    NEW.sleep_duration := (NEW.wake_time - NEW.bedtime);
  ELSE
    NEW.sleep_duration := NULL;
  END IF;
  RETURN NEW;
END;
$function$;

-- Recriar o trigger para garantir que está funcionando corretamente
DROP TRIGGER IF EXISTS trg_calc_sleep_duration ON public.sleep_tracking;

CREATE TRIGGER trg_calc_sleep_duration
BEFORE INSERT OR UPDATE ON public.sleep_tracking
FOR EACH ROW
EXECUTE FUNCTION public.calc_sleep_duration();