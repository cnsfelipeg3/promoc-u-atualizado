CREATE OR REPLACE FUNCTION public.validate_video_status()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status NOT IN ('pendente','gerando_arte','com_arte','gerando','aguardando_render','gerando_cena','com_cena','gerando_video','com_video','gerando_narracao','com_narracao','compondo','compondo_video','timeout_render','pronto','erro') THEN
    RAISE EXCEPTION 'Invalid video status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$function$;

ALTER TABLE videos ADD COLUMN IF NOT EXISTS storyboard jsonb;

INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true) ON CONFLICT DO NOTHING;