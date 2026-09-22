import { Local, Ambiente, Container, Categoria, Tag, Item, ItemWithDetails, FilterOptions } from '../types/inventory';
import { INITIAL_LOCAIS, INITIAL_AMBIENTES, INITIAL_CONTAINERS, INITIAL_CATEGORIAS, INITIAL_TAGS, INITIAL_ITENS } from '../seedData';
import { initSupabase } from './supabase';

const STORAGE_KEY_LOCAIS = 'home_inv_locais';
const STORAGE_KEY_AMBIENTES = 'home_inv_ambientes';
const STORAGE_KEY_CONTAINERS = 'home_inv_containers';
const STORAGE_KEY_CATEGORIAS = 'home_inv_categorias';
const STORAGE_KEY_TAGS = 'home_inv_tags';
const STORAGE_KEY_ITENS = 'home_inv_itens';

// Gerador e validador de UUIDs V4 válidos para compatibilidade total com PostgreSQL/Supabase
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isValidUUID(id?: string): boolean {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

class InventoryDatabase {
  public isCloudActive(): boolean {
    return !!initSupabase();
  }

  // --- MIGRAÇÃO AUTOMÁTICA DE IDs ANTIGOS PARA UUIDs VÁLIDOS DE BANCO RELACIONAL ---
  private migrateLegacyIds() {
    let meged = false;
    const legacyIdMap = new Map<string, string>();

    const getOrMigrateId = (oldId: string): string => {
      if (isValidUUID(oldId)) return oldId;
      if (!legacyIdMap.has(oldId)) {
        legacyIdMap.set(oldId, generateUUID());
      }
      return legacyIdMap.get(oldId)!;
    };

    // 1. Locais
    const locaisRaw = localStorage.getItem(STORAGE_KEY_LOCAIS);
    if (locaisRaw) {
      const locais: Local[] = JSON.parse(locaisRaw);
      const migratedLocais = locais.map(l => {
        const newId = getOrMigrateId(l.id);
        return { ...l, id: newId };
      });
      localStorage.setItem(STORAGE_KEY_LOCAIS, JSON.stringify(migratedLocais));
    }

    // 2. Ambientes
    const defaultLocalId = INITIAL_LOCAIS[0].id;
    const ambientesRaw = localStorage.getItem(STORAGE_KEY_AMBIENTES);
    if (ambientesRaw) {
      const ambientes: Ambiente[] = JSON.parse(ambientesRaw);
      const migratedAmbientes = ambientes.map(a => {
        const newId = getOrMigrateId(a.id);
        const newLocalId = getOrMigrateId(a.local_id || defaultLocalId);
        return { ...a, id: newId, local_id: newLocalId };
      });
      localStorage.setItem(STORAGE_KEY_AMBIENTES, JSON.stringify(migratedAmbientes));
    }

    // 3. Containers
    const containersRaw = localStorage.getItem(STORAGE_KEY_CONTAINERS);
    if (containersRaw) {
      const containers: Container[] = JSON.parse(containersRaw);
      const migratedContainers = containers.map(c => {
        const newId = getOrMigrateId(c.id);
        const newAmbId = getOrMigrateId(c.ambiente_id);
        return { ...c, id: newId, ambiente_id: newAmbId };
      });
      localStorage.setItem(STORAGE_KEY_CONTAINERS, JSON.stringify(migratedContainers));
    }

    // 4. Categorias
    const categoriasRaw = localStorage.getItem(STORAGE_KEY_CATEGORIAS);
    if (categoriasRaw) {
      const categorias: Categoria[] = JSON.parse(categoriasRaw);
      const migratedCategorias = categorias.map(c => {
        const newId = getOrMigrateId(c.id);
        return { ...c, id: newId };
      });
      localStorage.setItem(STORAGE_KEY_CATEGORIAS, JSON.stringify(migratedCategorias));
    }

    // 5. Tags
    const tagsRaw = localStorage.getItem(STORAGE_KEY_TAGS);
    if (tagsRaw) {
      const tags: Tag[] = JSON.parse(tagsRaw);
      const migratedTags = tags.map(t => {
        const newId = getOrMigrateId(t.id);
        return { ...t, id: newId };
      });
      localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(migratedTags));
    }

    // 6. Itens
    const itensRaw = localStorage.getItem(STORAGE_KEY_ITENS);
    if (itensRaw) {
      const itens: Item[] = JSON.parse(itensRaw);
      const migratedItens = itens.map(i => {
        const newId = getOrMigrateId(i.id);
        const newCntId = getOrMigrateId(i.container_id);
        const newCatId = i.categoria_id ? getOrMigrateId(i.categoria_id) : undefined;
        const newTagIds = (i.tag_ids || []).map(tid => getOrMigrateId(tid));
        return {
          ...i,
          id: newId,
          container_id: newCntId,
          categoria_id: newCatId,
          tag_ids: newTagIds,
        };
      });
      localStorage.setItem(STORAGE_KEY_ITENS, JSON.stringify(migratedItens));
    }
  }

  // --- INICIALIZAÇÃO E MIGRAÇÃO AUTOMÁTICA DE DADOS ---
  private initLocalData() {
    if (!localStorage.getItem(STORAGE_KEY_LOCAIS)) {
      localStorage.setItem(STORAGE_KEY_LOCAIS, JSON.stringify(INITIAL_LOCAIS));
    }
    if (!localStorage.getItem(STORAGE_KEY_AMBIENTES)) {
      localStorage.setItem(STORAGE_KEY_AMBIENTES, JSON.stringify(INITIAL_AMBIENTES));
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
    this.migrateLegacyIds();
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
  // SINCRONIZAÇÃO FORÇADA: LOCAL -> NUVEM SUPABASE
  // ==========================================
  public async syncAllLocalToCloud(): Promise<{
    success: boolean;
    message: string;
    counts?: { locais: number; ambientes: number; containers: number; categorias: number; tags: number; itens: number };
  }> {
    const supabase = initSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase não está configurado. Insira a URL e a Anon Key nas Configurações de Nuvem.' };
    }

    try {
      this.initLocalData();

      const locais: Local[] = JSON.parse(localStorage.getItem(STORAGE_KEY_LOCAIS) || '[]');
      const ambientes: Ambiente[] = JSON.parse(localStorage.getItem(STORAGE_KEY_AMBIENTES) || '[]');
      const containers: Container[] = JSON.parse(localStorage.getItem(STORAGE_KEY_CONTAINERS) || '[]');
      const categorias: Categoria[] = JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIAS) || '[]');
      const tags: Tag[] = JSON.parse(localStorage.getItem(STORAGE_KEY_TAGS) || '[]');
      const itens: Item[] = JSON.parse(localStorage.getItem(STORAGE_KEY_ITENS) || '[]');

      // 1. Upsert Locais
      if (locais.length > 0) {
        const { error } = await supabase.from('locais').upsert(locais);
        if (error) throw new Error(`Erro ao enviar Locais: ${error.message}`);
      }

      // 2. Upsert Ambientes
      if (ambientes.length > 0) {
        const { error } = await supabase.from('ambientes').upsert(ambientes);
        if (error) throw new Error(`Erro ao enviar Ambientes: ${error.message}`);
      }

      // 3. Upsert Containers
      if (containers.length > 0) {
        const { error } = await supabase.from('containers').upsert(containers);
        if (error) throw new Error(`Erro ao enviar Containers: ${error.message}`);
      }

      // 4. Upsert Categorias
      if (categorias.length > 0) {
        const { error } = await supabase.from('categorias').upsert(categorias);
        if (error) throw new Error(`Erro ao enviar Categorias: ${error.message}`);
      }

      // 5. Upsert Tags
      if (tags.length > 0) {
        const { error } = await supabase.from('tags').upsert(tags);
        if (error) throw new Error(`Erro ao enviar Tags: ${error.message}`);
      }

      // 6. Upsert Itens & Pivot Tags
      if (itens.length > 0) {
        for (const item of itens) {
          const { tag_ids, ...itemData } = item;
          const { error: itemError } = await supabase.from('itens').upsert(itemData);
          if (itemError) throw new Error(`Erro ao enviar Item "${item.nome}": ${itemError.message}`);

          if (tag_ids && tag_ids.length > 0) {
            await supabase.from('item_tags').delete().eq('item_id', item.id);
            const rows = tag_ids.map(tag_id => ({ item_id: item.id, tag_id }));
            await supabase.from('item_tags').insert(rows);
          }
        }
      }

      return {
        success: true,
        message: 'Todos os seus dados e fotos locais foram sincronizados com o Supabase com sucesso!',
        counts: {
          locais: locais.length,
          ambientes: ambientes.length,
          containers: containers.length,
          categorias: categorias.length,
          tags: tags.length,
          itens: itens.length
        }
      };
    } catch (err: any) {
      console.error('Erro na sincronização:', err);
      return {
        success: false,
        message: err.message || 'Erro inesperado durante a sincronização com o Supabase.'
      };
    }
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
    const id = isValidUUID(local.id) ? local.id! : generateUUID();
    const newLocal: Local = {
      ...local,
      id,
      created_at: local.created_at || new Date().toISOString()
    };

    if (supabase) {
      const { error } = await supabase.from('locais').upsert(newLocal);
      if (error) console.error('Erro ao salvar local no Supabase:', error);
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
      if (!error && data && data.length > 0) {
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
    const id = isValidUUID(ambiente.id) ? ambiente.id! : generateUUID();
    const locais = await this.getLocais();
    const defaultLocalId = locais[0]?.id || '11111111-0000-4000-8000-000000000001';

    const newAmbiente: Ambiente = {
      ...ambiente,
      id,
      local_id: ambiente.local_id || defaultLocalId,
      created_at: ambiente.created_at || new Date().toISOString()
    };

    if (supabase) {
      const { error } = await supabase.from('ambientes').upsert(newAmbiente);
      if (error) console.error('Erro ao salvar ambiente no Supabase:', error);
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
      if (!error && data && data.length > 0) return data as Container[];
    }
    this.initLocalData();
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY_CONTAINERS) || '[]');
    return items.sort((a: Container, b: Container) => a.nome.localeCompare(b.nome));
  }

  async saveContainer(container: Omit<Container, 'id'> & { id?: string }): Promise<Container> {
    const supabase = initSupabase();
    const id = isValidUUID(container.id) ? container.id! : generateUUID();
    const newContainer: Container = {
      ...container,
      id,
      created_at: container.created_at || new Date().toISOString()
    };

    if (supabase) {
      const { error } = await supabase.from('containers').upsert(newContainer);
      if (error) console.error('Erro ao salvar container no Supabase:', error);
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
      if (!error && data && data.length > 0) return data as Categoria[];
    }
    this.initLocalData();
    return JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIAS) || '[]');
  }

  async getTags(): Promise<Tag[]> {
    const supabase = initSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('tags').select('*').order('nome');
      if (!error && data && data.length > 0) return data as Tag[];
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
      if (!error && data && data.length > 0) {
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
    const id = isValidUUID(item.id) ? item.id! : generateUUID();
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
      const { error: itemErr } = await supabase.from('itens').upsert(itemData);
      if (itemErr) console.error('Erro ao salvar item no Supabase:', itemErr);

      await supabase.from('item_tags').delete().eq('item_id', id);
      if (tag_ids && tag_ids.length > 0) {
        const rows = tag_ids.map(tag_id => ({ item_id: id, tag_id }));
        const { error: tagErr } = await supabase.from('item_tags').insert(rows);
        if (tagErr) console.error('Erro ao salvar item_tags no Supabase:', tagErr);
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
