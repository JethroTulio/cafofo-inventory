export interface Local {
  id: string;
  nome: string;
  descricao?: string;
  foto_url?: string;
  created_at?: string;
}

export interface Ambiente {
  id: string;
  local_id?: string;
  nome: string;
  descricao?: string;
  foto_url?: string;
  created_at?: string;
}

export interface Container {
  id: string;
  ambiente_id: string;
  nome: string;
  foto_url?: string;
  created_at?: string;
}

export interface Categoria {
  id: string;
  nome: string;
  icone: string; // ex: 'cpu', 'wrench', 'shirt', 'file-text', 'package', 'box'
  cor: string;  // Hex color ex: '#3B82F6'
}

export interface Tag {
  id: string;
  nome: string;
  cor: string; // Hex color
}

export interface Item {
  id: string;
  container_id: string;
  categoria_id?: string;
  nome: string;
  sub_localizacao?: string; // ex: "Gaveta 2", "Prateleira B"
  descricao?: string;
  preco: number;
  quantidade: number;
  data_validade?: string; // ISO Date YYYY-MM-DD
  foto_url?: string;
  created_at?: string;
  tag_ids?: string[];
}

export interface ItemWithDetails extends Item {
  container?: Container;
  ambiente?: Ambiente;
  local?: Local;
  categoria?: Categoria;
  tags?: Tag[];
  pathText?: string; // ex: "Apartamento > Escritório > Gaveteiro Principal > Gaveta 2"
  valorTotal?: number; // preco * quantidade
}

export interface FilterOptions {
  searchQuery: string;
  localId?: string;
  ambienteId?: string;
  containerId?: string;
  categoriaId?: string;
  tagIds: string[];
  expiringDays?: number | null; // ex: 30 days
  onlyExpired?: boolean;
}

export interface CloudCredentials {
  supabaseUrl: string;
  supabaseAnonKey: string;
}
