
-- Tabela de promoções
CREATE TABLE public.promocoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origem text NOT NULL,
  destino text NOT NULL,
  preco numeric NOT NULL,
  preco_normal numeric,
  pct_desconto numeric,
  preco_cliente numeric,
  margem_pct numeric DEFAULT 10,
  cia_aerea text,
  tipo_voo text DEFAULT 'ida_volta',
  classe text DEFAULT 'economica',
  validade text,
  bagagem text,
  escalas text,
  score numeric DEFAULT 0,
  score_justificativa text,
  status text DEFAULT 'pendente',
  fonte text,
  url_fonte text,
  dados_extras jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de vídeos
CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promocao_id uuid REFERENCES public.promocoes(id) ON DELETE CASCADE,
  arte_url text,
  video_url text,
  narration_url text,
  video_final_url text,
  higgsfield_request_id text,
  elevenlabs_request_id text,
  status text DEFAULT 'pendente',
  erro_detalhes text,
  payload jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de logs dos agentes
CREATE TABLE public.logs_agentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agente text NOT NULL,
  mensagem text NOT NULL,
  tipo text DEFAULT 'info',
  payload jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Tabela de configuração dos agentes
CREATE TABLE public.config_agentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agente text UNIQUE NOT NULL,
  ativo boolean DEFAULT true,
  config jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Tabela de métricas
CREATE TABLE public.metricas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  valor numeric,
  dados jsonb DEFAULT '{}',
  periodo text,
  created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX idx_promocoes_status ON public.promocoes(status);
CREATE INDEX idx_promocoes_created ON public.promocoes(created_at DESC);
CREATE INDEX idx_videos_status ON public.videos(status);
CREATE INDEX idx_videos_promocao ON public.videos(promocao_id);
CREATE INDEX idx_logs_agente ON public.logs_agentes(agente, created_at DESC);

-- Validation triggers instead of CHECK constraints
CREATE OR REPLACE FUNCTION public.validate_promocao_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pendente','precificada','aprovada','rejeitada','em_producao','video_pronto','publicada','arquivada') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_promocao_status
BEFORE INSERT OR UPDATE ON public.promocoes
FOR EACH ROW EXECUTE FUNCTION public.validate_promocao_status();

CREATE OR REPLACE FUNCTION public.validate_video_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pendente','gerando_arte','com_arte','gerando_video','com_video','gerando_narracao','com_narracao','pronto','erro') THEN
    RAISE EXCEPTION 'Invalid video status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_video_status
BEFORE INSERT OR UPDATE ON public.videos
FOR EACH ROW EXECUTE FUNCTION public.validate_video_status();

CREATE OR REPLACE FUNCTION public.validate_log_tipo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo NOT IN ('info','warn','error','success') THEN
    RAISE EXCEPTION 'Invalid log tipo: %', NEW.tipo;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_log_tipo
BEFORE INSERT OR UPDATE ON public.logs_agentes
FOR EACH ROW EXECUTE FUNCTION public.validate_log_tipo();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_promocoes_updated_at
BEFORE UPDATE ON public.promocoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_config_agentes_updated_at
BEFORE UPDATE ON public.config_agentes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.promocoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_agentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_agentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can read/write all (admin panel)
CREATE POLICY "Authenticated users can read promocoes" ON public.promocoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert promocoes" ON public.promocoes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update promocoes" ON public.promocoes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete promocoes" ON public.promocoes FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read videos" ON public.videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert videos" ON public.videos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update videos" ON public.videos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete videos" ON public.videos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read logs" ON public.logs_agentes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert logs" ON public.logs_agentes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read config" ON public.config_agentes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update config" ON public.config_agentes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read metricas" ON public.metricas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert metricas" ON public.metricas FOR INSERT TO authenticated WITH CHECK (true);

-- Service role policies for edge functions
CREATE POLICY "Service role full access promocoes" ON public.promocoes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access videos" ON public.videos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access logs" ON public.logs_agentes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access config" ON public.config_agentes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access metricas" ON public.metricas FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.promocoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.logs_agentes;
