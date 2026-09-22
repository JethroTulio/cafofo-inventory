import { Local, Ambiente, Container, Categoria, Tag, Item } from './types/inventory';

export const INITIAL_LOCAIS: Local[] = [
  {
    id: '11111111-0000-4000-8000-000000000001',
    nome: 'Apartamento Principal',
    descricao: 'Residência oficial da família',
    foto_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: '11111111-0000-4000-8000-000000000002',
    nome: 'Escritório do Trabalho',
    descricao: 'Sede da empresa e escritório comercial',
    foto_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: '11111111-0000-4000-8000-000000000003',
    nome: 'Casa da Mãe',
    descricao: 'Casa da família e guarda de volumes',
    foto_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString(),
  }
];

export const INITIAL_CATEGORIAS: Categoria[] = [
  { id: 'c1000000-0000-4000-8000-000000000001', nome: 'Eletrônicos', icone: 'cpu', cor: '#3B82F6' },
  { id: 'c1000000-0000-4000-8000-000000000002', nome: 'Ferramentas', icone: 'wrench', cor: '#F59E0B' },
  { id: 'c1000000-0000-4000-8000-000000000003', nome: 'Vestuário & Acessórios', icone: 'shirt', cor: '#EC4899' },
  { id: 'c1000000-0000-4000-8000-000000000004', nome: 'Documentos', icone: 'file-text', cor: '#10B981' },
  { id: 'c1000000-0000-4000-8000-000000000005', nome: 'Consumíveis & Despensa', icone: 'package', cor: '#8B5CF6' },
];

export const INITIAL_TAGS: Tag[] = [
  { id: 'f1000000-0000-4000-8000-000000000001', nome: 'Garantia Ativa', cor: '#10B981' },
  { id: 'f1000000-0000-4000-8000-000000000002', nome: 'Emprestado', cor: '#EF4444' },
  { id: 'f1000000-0000-4000-8000-000000000003', nome: 'Doação', cor: '#F59E0B' },
  { id: 'f1000000-0000-4000-8000-000000000004', nome: 'Frágil', cor: '#8B5CF6' },
  { id: 'f1000000-0000-4000-8000-000000000005', nome: 'Uso Frequente', cor: '#3B82F6' },
];

export const INITIAL_AMBIENTES: Ambiente[] = [
  {
    id: 'a1000000-0000-4000-8000-000000000001',
    local_id: '11111111-0000-4000-8000-000000000001',
    nome: 'Escritório',
    descricao: 'Espaço de trabalho, periféricos e documentação',
    foto_url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'a1000000-0000-4000-8000-000000000002',
    local_id: '11111111-0000-4000-8000-000000000001',
    nome: 'Garagem & Oficina',
    descricao: 'Ferramentas manuais, elétricas e artigos automotivos',
    foto_url: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'a1000000-0000-4000-8000-000000000003',
    local_id: '11111111-0000-4000-8000-000000000001',
    nome: 'Cozinha & Despensa',
    descricao: 'Eletrodomésticos, mantimentos e utensílios culinários',
    foto_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'a1000000-0000-4000-8000-000000000004',
    local_id: '11111111-0000-4000-8000-000000000002',
    nome: 'Recepção e Sala de Reuniões',
    descricao: 'Equipamentos de apresentação e arquivos',
    foto_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString(),
  }
];

export const INITIAL_CONTAINERS: Container[] = [
  {
    id: 'b1000000-0000-4000-8000-000000000001',
    ambiente_id: 'a1000000-0000-4000-8000-000000000001',
    nome: 'Gaveteiro Principal',
    foto_url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b1000000-0000-4000-8000-000000000002',
    ambiente_id: 'a1000000-0000-4000-8000-000000000001',
    nome: 'Armário de Tecnologia',
    foto_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b1000000-0000-4000-8000-000000000003',
    ambiente_id: 'a1000000-0000-4000-8000-000000000002',
    nome: 'Painel de Ferramentas',
    foto_url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString(),
  }
];

export const INITIAL_ITENS: Item[] = [
  {
    id: 'e1000000-0000-4000-8000-000000000001',
    container_id: 'b1000000-0000-4000-8000-000000000001',
    categoria_id: 'c1000000-0000-4000-8000-000000000001',
    nome: 'Cabo HDMI 2.1 Ultra High Speed 4K/8K',
    sub_localizacao: 'Gaveta 2',
    descricao: 'Cabo trançado de alta velocidade para monitores 4K',
    preco: 89.90,
    quantidade: 2,
    foto_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString(),
    tag_ids: ['f1000000-0000-4000-8000-000000000005']
  },
  {
    id: 'e1000000-0000-4000-8000-000000000002',
    container_id: 'b1000000-0000-4000-8000-000000000001',
    categoria_id: 'c1000000-0000-4000-8000-000000000002',
    nome: 'Alicate Universal Isolado 1000V',
    sub_localizacao: 'Gaveta 1',
    descricao: 'Alicate isolado para manutenção elétrica residencial',
    preco: 65.00,
    quantidade: 1,
    foto_url: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString(),
    tag_ids: []
  },
  {
    id: 'e1000000-0000-4000-8000-000000000003',
    container_id: 'b1000000-0000-4000-8000-000000000002',
    categoria_id: 'c1000000-0000-4000-8000-000000000001',
    nome: 'Webcam Logitech C920 Full HD',
    sub_localizacao: 'Prateleira A',
    descricao: 'Câmera com microfone estéreo para videoconferências',
    preco: 380.00,
    quantidade: 1,
    data_validade: '2026-10-15',
    foto_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString(),
    tag_ids: ['f1000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000005']
  }
];
