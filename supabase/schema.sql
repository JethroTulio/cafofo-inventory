-- ====================================================================
-- INVENTÁRIO DOMÉSTICO (HOME INVENTORY) - ESTRUTURA DO BANCO DE DADOS
-- Banco de Dados Relacional: PostgreSQL / Supabase
-- Hierarquia Espacial de 4 Níveis: Locais -> Ambientes -> Containers -> Itens
-- ====================================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. TABELA DE LOCAIS (Nível 0 Espacial - Ex: Apartamento, Trabalho, Casa da Mãe)
CREATE TABLE IF NOT EXISTS locais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1. TABELA DE AMBIENTES (Nível 1 Espacial)
CREATE TABLE IF NOT EXISTS ambientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    local_id UUID REFERENCES locais(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE CONTAINERS (Nível 2 Espacial)
CREATE TABLE IF NOT EXISTS containers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambiente_id UUID NOT NULL REFERENCES ambientes(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE CATEGORIAS (Taxonomia 1:N)
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    icone VARCHAR(50) DEFAULT 'box',
    cor VARCHAR(20) DEFAULT '#3B82F6'
);

-- 4. TABELA DE TAGS (Taxonomia N:N)
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(50) NOT NULL UNIQUE,
    cor VARCHAR(20) DEFAULT '#6B7280'
);

-- 5. TABELA DE ITENS (Nível 3 Espacial)
CREATE TABLE IF NOT EXISTS itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    container_id UUID NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    nome VARCHAR(150) NOT NULL,
    sub_localizacao VARCHAR(100), -- ex: "Gaveta 2", "Prateleira B"
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    quantidade INT NOT NULL DEFAULT 1,
    data_validade DATE,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABELA DE ASSOCIAÇÃO ITEM_TAGS (Pivô N:N)
CREATE TABLE IF NOT EXISTS item_tags (
    item_id UUID NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (item_id, tag_id)
);

-- ====================================================================
-- ÍNDICES PARA ALTA PERFORMANCE DE PESQUISA E BUSCA GLOBAL
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_ambientes_local ON ambientes(local_id);
CREATE INDEX IF NOT EXISTS idx_containers_ambiente ON containers(ambiente_id);
CREATE INDEX IF NOT EXISTS idx_itens_container ON itens(container_id);
CREATE INDEX IF NOT EXISTS idx_itens_categoria ON itens(categoria_id);
CREATE INDEX IF NOT EXISTS idx_itens_nome ON itens USING gin(to_tsvector('portuguese', nome));
CREATE INDEX IF NOT EXISTS idx_itens_descricao ON itens USING gin(to_tsvector('portuguese', coalesce(descricao, '')));

-- ====================================================================
-- CONFIGURAÇÃO DE SEGURANÇA RLS (ROW LEVEL SECURITY) E POLÍTICAS
-- ====================================================================
ALTER TABLE locais ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Público para Desenvolvimento/Uso Residencial
CREATE POLICY "Permitir acesso total em locais" ON locais FOR ALL USING (true);
CREATE POLICY "Permitir acesso total em ambientes" ON ambientes FOR ALL USING (true);
CREATE POLICY "Permitir acesso total em containers" ON containers FOR ALL USING (true);
CREATE POLICY "Permitir acesso total em categorias" ON categorias FOR ALL USING (true);
CREATE POLICY "Permitir acesso total em tags" ON tags FOR ALL USING (true);
CREATE POLICY "Permitir acesso total em itens" ON itens FOR ALL USING (true);
CREATE POLICY "Permitir acesso total em item_tags" ON item_tags FOR ALL USING (true);

-- ====================================================================
-- DADOS SEED (INICIAIS DEMONSTRATIVOS COM UUIDs HEXADECIMAIS VÁLIDOS 0-9 a-f)
-- ====================================================================

-- Inserir Locais (UUIDs válidos)
INSERT INTO locais (id, nome, descricao, foto_url) VALUES
('11111111-0000-4000-8000-000000000001', 'Apartamento Principal', 'Residência principal da família', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'),
('11111111-0000-4000-8000-000000000002', 'Escritório Comercial', 'Espaço de trabalho e empresa', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'),
('11111111-0000-4000-8000-000000000003', 'Casa da Mãe', 'Casa da família e depósito de guardados', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (id) DO NOTHING;

-- Inserir Categorias Padrão
INSERT INTO categorias (id, nome, icone, cor) VALUES
('c1000000-0000-4000-8000-000000000001', 'Eletrônicos', 'cpu', '#3B82F6'),
('c1000000-0000-4000-8000-000000000002', 'Ferramentas', 'wrench', '#F59E0B'),
('c1000000-0000-4000-8000-000000000003', 'Vestuário', 'shirt', '#EC4899'),
('c1000000-0000-4000-8000-000000000004', 'Documentos', 'file-text', '#10B981'),
('c1000000-0000-4000-8000-000000000005', 'Consumíveis & Alimentos', 'package', '#8B5CF6')
ON CONFLICT (nome) DO NOTHING;

-- Inserir Tags Padrão
INSERT INTO tags (id, nome, cor) VALUES
('f1000000-0000-4000-8000-000000000001', 'Garantia Ativa', '#10B981'),
('f1000000-0000-4000-8000-000000000002', 'Emprestado', '#EF4444'),
('f1000000-0000-4000-8000-000000000003', 'Doação', '#F59E0B'),
('f1000000-0000-4000-8000-000000000004', 'Frágil', '#8B5CF6'),
('f1000000-0000-4000-8000-000000000005', 'Uso Frequente', '#3B82F6')
ON CONFLICT (nome) DO NOTHING;

-- Inserir Ambientes vinculados a Locais
INSERT INTO ambientes (id, local_id, nome, descricao, foto_url) VALUES
('a1000000-0000-4000-8000-000000000001', '11111111-0000-4000-8000-000000000001', 'Escritório', 'Espaço de trabalho e equipamentos de tecnologia', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80'),
('a1000000-0000-4000-8000-000000000002', '11111111-0000-4000-8000-000000000001', 'Garagem', 'Oficina de ferramentas e guarda de equipamentos pesados', 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=600&q=80'),
('a1000000-0000-4000-8000-000000000003', '11111111-0000-4000-8000-000000000001', 'Cozinha', 'Despensa e utensílios eletrodomésticos', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80'),
('a1000000-0000-4000-8000-000000000004', '11111111-0000-4000-8000-000000000002', 'Recepção e Sala de Reunião', 'Equipamentos e apresentações', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (id) DO NOTHING;

-- Inserir Containers
INSERT INTO containers (id, ambiente_id, nome, foto_url) VALUES
('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'Gaveteiro Principal', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80'),
('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'Armário de Tecnologia', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'),
('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000002', 'Painel de Ferramentas', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (id) DO NOTHING;

-- Inserir Itens
INSERT INTO itens (id, container_id, categoria_id, nome, sub_localizacao, descricao, preco, quantidade, data_validade, foto_url) VALUES
('e1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'Cabo HDMI 2.1 Ultra High Speed 4K/8K', 'Gaveta 2', 'Cabo trançado de alta velocidade para monitores 4K', 89.90, 2, NULL, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'),
('e1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 'Alicate Universal Isolado 1000V', 'Gaveta 1', 'Alicate de pressão com cabo emborrachado', 65.00, 1, NULL, 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&q=80'),
('e1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'Webcam Full HD 1080p', 'Prateleira A', 'Webcam Logitech C920 com microfone integrado', 350.00, 1, NULL, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (id) DO NOTHING;
