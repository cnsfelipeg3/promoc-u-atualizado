ALTER TABLE promocoes ADD COLUMN IF NOT EXISTS duracao_narracao_s numeric;
ALTER TABLE promocoes ADD COLUMN IF NOT EXISTS clipes_urls jsonb DEFAULT '[]'::jsonb;
ALTER TABLE promocoes ADD COLUMN IF NOT EXISTS video_prompts jsonb;
ALTER TABLE promocoes ADD COLUMN IF NOT EXISTS video_final_url text;

UPDATE config_agentes
SET config = COALESCE(config, '{}'::jsonb) || jsonb_build_object('elevenlabs_voice', 'nPczCjzI2devNBz1zQrb')
WHERE agente = 'orquestrador'
  AND (config->>'elevenlabs_voice' IS NULL OR config->>'elevenlabs_voice' = '');