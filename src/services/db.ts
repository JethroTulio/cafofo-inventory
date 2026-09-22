import { Local, Ambiente, Container, Categoria, Tag, Item, ItemWithDetails, FilterOptions } from '../types/inventory';
import { INITIAL_LOCAIS, INITIAL_AMBIENTES, INITIAL_CONTAINERS, INITIAL_CATEGORIAS, INITIAL_TAGS, INITIAL_ITENS } from '../seedData';
import { initSupabase } from './supabase';

const STORAGE_KEY_LOCAIS = 'home_inv_locais';
const STORAGE_KEY_AMBIENTES = 'home_inv_ambientes';
const STORAGE_KEY_CONTAINERS = 'home_inv_containers';
const STORAGE_KEY_CATEGORIAS = 'home_inv_categorias';
const STORAGE_KEY_TAGS = 'home_inv_tags';
const STORAGE_KEY_ITENS = 'home_inv_itens';

class InventoryDatabase {
  private isCloudActive(): boolean {
    return !!initSupabase();
  }

  // --- INICIALIZAÇÃO E MIGRAÇÃO AUTOMÁTICA DE DADOS ---
  private initLocalData() {
    if (!localStorage.getItem(STORAGE_KEY_LOCAIS)) {
      localStorage.setItem(STORAGE_KEY_LOCAIS, JSON.stringify(INITIAL_LOCAIS));
    }

    const defaultLocalId = INITIAL_LOCAIS[0].id; // '11111111-0000-4000-8000-000000000001'
    const ambientesRaw = localStorage.getItem(STORAGE_KEY_AMBIENTES);

    if (!ambientesRaw) {
      localStorage.setItem(STORAGE_KEY_AMBIENTES, JSON.stringify(INITIAL_AMBIENTES));
    } else {
      // MIGRAÇÃO AUTOMÁTICA: Garantir que todos os ambientes preexistentes tenham local_id
      const existingAmbientes: Ambiente[] = JSON.parse(ambientesRaw);
      let needsMigration = false;
      const migrated = existingAmbientes.map(a => {
        if (!a.local_id) {
          needsMigration = true;
          return { ...a, local_id: defaultLocalId };
        }
        return a;
      });
      if (needsMigration) {
        localStorage.setItem(STORAGE_KEY_AMBIENTES, JSON.stringify(migrated));
      }
    }

    if (!localStorage.getItem(STORAGE_KEY_CONTAINERS)) {
      localStorage.setItem(STORAGE_KEY_CONTAINERS, JSON.stringify(INITIAL_CONTAINERS));
    }
    if (!localStorage.getItem(STORAGE_KEY_CATEGORIAS)) {
      localStorage.setItem(STORAGE_KEY_CATEGORIAS, JSON.stringify(INITIAL_CATEGORIAS));
    }
    if (!localStorage.getItem(STORAGE_KEY_TAGS)) {
      localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(INITIAL_TAGS));
    }
    if (!localStorage.getItem(STORAGE_KEY_ITENS)) {
      localStorage.setItem(STORAGE_KEY_ITENS, JSON.stringify(INITIAL_ITENS));
    }
  }

  public resetToSeedData() {
    localStorage.setItem(STORAGE_KEY_LOCAIS, JSON.stringify(INITIAL_LOCAIS));
    localStorage.setItem(STORAGE_KEY_AMBIENTES, JSON.stringify(INITIAL_AMBIENTES));
    localStorage.setItem(STORAGE_KEY_CONTAINERS, JSON.stringify(INITIAL_CONTAINERS));
    localStorage.setItem(STORAGE_KEY_CATEGORIAS, JSON.stringify(INITIAL_CATEGORIAS));
    localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(INITIAL_TAGS));
    localStorage.setItem(STORAGE_KEY_ITENS, JSON.stringify(INITIAL_ITENS));
  }

  // ==========================================
  // LOCAIS (Nível 0 Espacial)
  // ==========================================
  async getLocais(): Promise<Local[]> {
    const supabase = initSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('locais').select('*').order('nome');
      if (!error && data && data.length > 0) return data as Local[];
    }
    this.initLocalData();
    const items: Local[] = JSON.parse(localStorage.getItem(STORAGE_KEY_LOCAIS) || '[]');
    if (items.length === 0) return INITIAL_LOCAIS;
    return items.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async saveLocal(local: Omit<Local, 'id'> & { id?: string }): Promise<Local> {
    const supabase = initSupabase();
    const id = local.id || 'loc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const newLocal: Local = {
      ...local,
      id,
      created_at: local.created_at || new Date().toISOString()
    };

    if (supabase) {
      await supabase.from('locais').upsert(newLocal);
    }

    this.initLocalData();
    const locais = await this.getLocais();
    const index = locais.findIndex(l => l.id === id);
    if (index >= 0) {
      locais[index] = newLocal;
    } else {
      locais.push(newLocal);
    }
    localStorage.setItem(STORAGE_KEY_LOCAIS, JSON.stringify(locais));
    return newLocal;
  }

  async deleteLocal(id: string): Promise<void> {
    const supabase = initSupabase();
    if (supabase) {
      await supabase.from('locais').delete().eq('id', id);
    }
    this.initLocalData();

    const locais: Local[] = JSON.parse(localStorage.getItem(STORAGE_KEY_LOCAIS) || '[]');
    const ambientes: Ambiente[] = JSON.parse(localStorage.getItem(STORAGE_KEY_AMBIENTES) || '[]');

    const ambientesToDelete = ambientes.filter(a => a.local_id === id).map(a => a.id);

    // Cascata local -> ambientes -> containers -> itens
    for (const ambId of ambientesToDelete) {
      await this.deleteAmbiente(ambId);
    }

    const updatedLocais = locais.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEY_LOCAIS, JSON.stringify(updatedLocais));
  }

  // ==========================================
  // AMBIENTES (Nível 1 Espacial)
  // ==========================================
  async getAmbientes(): Promise<Ambiente[]> {
    const locais = await this.getLocais();
    const defaultLocalId = locais[0]?.id || '11111111-0000-4000-8000-000000000001';

    const supabase = initSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('ambientes').select('*').order('nome');
      if (!error && data) {
        return data.map((a: any) => ({
          ...a,
          local_id: a.local_id || defaultLocalId
        })) as Ambiente[];
      }
    }
    this.initLocalData();
    const items: Ambiente[] = JSON.parse(localStorage.getItem(STORAGE_KEY_AMBIENTES) || '[]');
    return items.map(a => ({
      ...a,
      local_id: a.local_id || defaultLocalId
    })).sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async getAmbientesByLocal(localId: string): Promise<Ambiente[]> {
    const ambientes = await this.getAmbientes();
    return ambientes.filter(a => a.local_id === localId);
  }

  async saveAmbiente(ambiente: Omit<Ambiente, 'id'> & { id?: string }): Promise<Ambiente> {
    const supabase = initSupabase();
    const id = ambiente.id || 'amb-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const locais = await this.getLocais();
    const defaultLocalId = locais[0]?.id || '11111111-0000-4000-8000-000000000001';

    const newAmbiente: Ambiente = {
      ...ambiente,
      id,
      local_id: ambiente.local_id || defaultLocalId,
      created_at: ambiente.created_at || new Date().toISOString()
    };

    if (supabase) {
      await supabase.from('ambientes').upsert(newAmbiente);
    }

    this.initLocalData();
    const ambientes = await this.getAmbientes();
    const index = ambientes.findIndex(a => a.id === id);
    if (index >= 0) {
      ambientes[index] = newAmbiente;
    } else {
      ambientes.push(newAmbiente);
    }
    localStorage.setItem(STORAGE_KEY_AMBIENTES, JSON.stringify(ambientes));
    return newAmbiente;
  }

  async deleteAmbiente(id: string): Promise<void> {
    const supabase = initSupabase();
    if (supabase) {
      await supabase.from('ambientes').delete().eq('id', id);
    }
    this.initLocalData();
    const ambientes: Ambiente[] = JSON.parse(localStorage.getItem(STORAGE_KEY_AMBIENTES) || '[]');
    const containers: Container[] = JSON.parse(localStorage.getItem(STORAGE_KEY_CONTAINERS) || '[]');
    const itens: Item[] = JSON.parse(localStorage.getItem(STORAGE_KEY_ITENS) || '[]');

    const containersToDelete = containers.filter(c => c.ambiente_id === id).map(c => c.id);

    const updatedAmbientes = ambientes.filter(a => a.id !== id);
    const updatedContainers = containers.filter(c => c.ambiente_id !== id);
    const updatedItens = itens.filter(i => !containersToDelete.includes(i.container_id));

    localStorage.setItem(STORAGE_KEY_AMBIENTES, JSON.stringify(updatedAmbientes));
    localStorage.setItem(STORAGE_KEY_CONTAINERS, JSON.stringify(updatedContainers));
    localStorage.setItem(STORAGE_KEY_ITENS, JSON.stringify(updatedItens));
  }

  // ==========================================
  // CONTAINERS (Nível 2 Espacial)
  // ==========================================
  async getContainers(): Promise<Container[]> {
    const supabase = initSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('containers').select('*').order('nome');
      if (!error && data) return data as Container[];
    }
    this.initLocalData();
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY_CONTAINERS) || '[]');
    return items.sort((a: Container, b: Container) => a.nome.localeCompare(b.nome));
  }

  async saveContainer(container: Omit<Container, 'id'> & { id?: string }): Promise<Container> {
    const supabase = initSupabase();
    const id = container.id || 'cnt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const newContainer: Container = {
      ...container,
      id,
      created_at: container.created_at || new Date().toISOString()
    };

    if (supabase) {
      await supabase.from('containers').upsert(newContainer);
    }

    this.initLocalData();
    const containers = await this.getContainers();
    const index = containers.findIndex(c => c.id === id);
    if (index >= 0) {
      containers[index] = newContainer;
    } else {
      containers.push(newContainer);
    }
    localStorage.setItem(STORAGE_KEY_CONTAINERS, JSON.stringify(containers));
    return newContainer;
  }

  async deleteContainer(id: string): Promise<void> {
    const supabase = initSupabase();
    if (supabase) {
      await supabase.from('containers').delete().eq('id', id);
    }
    this.initLocalData();
    const containers: Container[] = JSON.parse(localStorage.getItem(STORAGE_KEY_CONTAINERS) || '[]');
    const itens: Item[] = JSON.parse(localStorage.getItem(STORAGE_KEY_ITENS) || '[]');

    const updatedContainers = containers.filter(c => c.id !== id);
    const updatedItens = itens.filter(i => i.container_id !== id);

    localStorage.setItem(STORAGE_KEY_CONTAINERS, JSON.stringify(updatedContainers));
    localStorage.setItem(STORAGE_KEY_ITENS, JSON.stringify(updatedItens));
  }

  // ==========================================
  // CATEGORIAS & TAGS
  // ==========================================
  async getCategorias(): Promise<Categoria[]> {
    const supabase = initSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('categorias').select('*').order('nome');
      if (!error && data) return data as Categoria[];
    }
    this.initLocalData();
    return JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIAS) || '[]');
  }

  async getTags(): Promise<Tag[]> {
    const supabase = initSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('tags').select('*').order('nome');
      if (!error && data) return data as Tag[];
    }
    this.initLocalData();
    return JSON.parse(localStorage.getItem(STORAGE_KEY_TAGS) || '[]');
  }

  // ==========================================
  // ITENS & BUSCA / DETALHES COMPLETO (4 NÍVEIS)
  // ==========================================
  async getItens(): Promise<Item[]> {
    const supabase = initSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('itens').select('*, item_tags(tag_id)').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((i: any) => ({
          ...i,
          tag_ids: i.item_tags ? i.item_tags.map((t: any) => t.tag_id) : []
        })) as Item[];
      }
    }
    this.initLocalData();
    return JSON.parse(localStorage.getItem(STORAGE_KEY_ITENS) || '[]');
  }

  async saveItem(item: Omit<Item, 'id'> & { id?: string }): Promise<Item> {
    const supabase = initSupabase();
    const id = item.id || 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const newItem: Item = {
      ...item,
      id,
      preco: Number(item.preco) || 0,
      quantidade: Number(item.quantidade) || 1,
      tag_ids: item.tag_ids || [],
      created_at: item.created_at || new Date().toISOString()
    };

    if (supabase) {
      const { tag_ids, ...itemData } = newItem;
      await supabase.from('itens').upsert(itemData);
      await supabase.from('item_tags').delete().eq('item_id', id);
      if (tag_ids && tag_ids.length > 0) {
        const rows = tag_ids.map(tag_id => ({ item_id: id, tag_id }));
        await supabase.from('item_tags').insert(rows);
      }
    }

    this.initLocalData();
    const itens = await this.getItens();
    const idx = itens.findIndex(i => i.id === id);
    if (idx >= 0) {
      itens[idx] = newItem;
    } else {
      itens.unshift(newItem);
    }
    localStorage.setItem(STORAGE_KEY_ITENS, JSON.stringify(itens));
    return newItem;
  }

  async deleteItem(id: string): Promise<void> {
    const supabase = initSupabase();
    if (supabase) {
      await supabase.from('itens').delete().eq('id', id);
    }
    this.initLocalData();
    const itens: Item[] = JSON.parse(localStorage.getItem(STORAGE_KEY_ITENS) || '[]');
    const updated = itens.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY_ITENS, JSON.stringify(updated));
  }

  // RESOLUÇÃO DE DETALHES EM 4 NÍVEIS: Local -> Ambiente -> Container -> Item
  async getItensWithDetails(filters?: FilterOptions): Promise<ItemWithDetails[]> {
    const [itens, containers, ambientes, locais, categorias, tags] = await Promise.all([
      this.getItens(),
      this.getContainers(),
      this.getAmbientes(),
      this.getLocais(),
      this.getCategorias(),
      this.getTags(),
    ]);

    const defaultLocalId = locais[0]?.id || '11111111-0000-4000-8000-000000000001';

    const containerMap = new Map<string, Container>(containers.map(c => [c.id, c]));
    const ambienteMap = new Map<string, Ambiente>(ambientes.map(a => [a.id, { ...a, local_id: a.local_id || defaultLocalId }]));
    const localMap = new Map<string, Local>(locais.map(l => [l.id, l]));
    const categoriaMap = new Map<string, Categoria>(categorias.map(c => [c.id, c]));
    const tagMap = new Map<string, Tag>(tags.map(t => [t.id, t]));

    let results: ItemWithDetails[] = itens.map(item => {
      const container = containerMap.get(item.container_id);
      const ambiente = container ? ambienteMap.get(container.ambiente_id) : undefined;
      const ambienteLocalId = ambiente ? (ambiente.local_id || defaultLocalId) : undefined;
      const local = ambienteLocalId ? localMap.get(ambienteLocalId) : undefined;
      const categoria = item.categoria_id ? categoriaMap.get(item.categoria_id) : undefined;
      const itemTags = (item.tag_ids || []).map(tid => tagMap.get(tid)).filter(Boolean) as Tag[];

      const pathParts = [];
      if (local) pathParts.push(local.nome);
      if (ambiente) pathParts.push(ambiente.nome);
      if (container) pathParts.push(container.nome);
      if (item.sub_localizacao) pathParts.push(item.sub_localizacao);
      const pathText = pathParts.join(' > ');

      const valorTotal = (Number(item.preco) || 0) * (Number(item.quantidade) || 1);

      return {
        ...item,
        container,
        ambiente,
        local,
        categoria,
        tags: itemTags,
        pathText,
        valorTotal,
      };
    });

    // APLICAÇÃO DE FILTROS CRUZADOS
    if (filters) {
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        results = results.filter(i =>
          i.nome.toLowerCase().includes(query) ||
          (i.descricao && i.descricao.toLowerCase().includes(query)) ||
          (i.sub_localizacao && i.sub_localizacao.toLowerCase().includes(query)) ||
          (i.pathText && i.pathText.toLowerCase().includes(query))
        );
      }

      if (filters.localId) {
        results = results.filter(i => i.local?.id === filters.localId);
      }

      if (filters.ambienteId) {
        results = results.filter(i => i.ambiente?.id === filters.ambienteId);
      }

      if (filters.containerId) {
        results = results.filter(i => i.container_id === filters.containerId);
      }

      if (filters.categoriaId) {
        results = results.filter(i => i.categoria_id === filters.categoriaId);
      }

      if (filters.tagIds && filters.tagIds.length > 0) {
        results = results.filter(i =>
          i.tag_ids && filters.tagIds.every(tId => i.tag_ids?.includes(tId))
        );
      }

      if (filters.onlyExpired) {
        const todayStr = new Date().toISOString().split('T')[0];
        results = results.filter(i => i.data_validade && i.data_validade < todayStr);
      } else if (filters.expiringDays) {
        const today = new Date();
        const limitDate = new Date();
        limitDate.setDate(today.getDate() + filters.expiringDays);
        const todayStr = today.toISOString().split('T')[0];
        const limitStr = limitDate.toISOString().split('T')[0];

        results = results.filter(i =>
          i.data_validade && i.data_validade >= todayStr && i.data_validade <= limitStr
        );
      }
    }

    return results;
  }
}

export const db = new InventoryDatabase();
