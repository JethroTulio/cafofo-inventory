import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { Local, Ambiente, Container, Categoria, Tag, Item, ItemWithDetails, FilterOptions } from './types/inventory';
import { Header } from './components/layout/Header';
import { Breadcrumbs } from './components/layout/Breadcrumbs';
import { Dashboard } from './components/dashboard/Dashboard';
import { LocalView } from './components/navigation/LocalView';
import { ContainerGrid } from './components/navigation/ContainerGrid';
import { ContainerView } from './components/navigation/ContainerView';
import { SearchView } from './components/navigation/SearchView';

// Modals
import { ItemFormModal } from './components/items/ItemFormModal';
import { ItemDetailModal } from './components/items/ItemDetailModal';
import { FilterDrawer } from './components/items/FilterDrawer';
import { LocalFormModal } from './components/navigation/LocalFormModal';
import { AmbienteFormModal } from './components/navigation/AmbienteFormModal';
import { ContainerFormModal } from './components/navigation/ContainerFormModal';
import { QRScannerModal } from './components/qrcode/QRScannerModal';
import { LabelPrintModal } from './components/qrcode/LabelPrintModal';
import { ExportModal } from './components/common/ExportModal';
import { CloudSettingsModal } from './components/common/CloudSettingsModal';

export function App() {
  // Estado dos Dados principais (4 Níveis)
  const [locais, setLocais] = useState<Local[]>([]);
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [allItems, setAllItems] = useState<ItemWithDetails[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado da Navegação Espacial (4 Níveis)
  const [activeView, setActiveView] = useState<'dashboard' | 'spatial' | 'search'>('dashboard');
  const [selectedLocal, setSelectedLocal] = useState<Local | null>(null);
  const [selectedAmbiente, setSelectedAmbiente] = useState<Ambiente | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);

  // Estado dos Filtros
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    localId: undefined,
    ambienteId: undefined,
    containerId: undefined,
    categoriaId: undefined,
    tagIds: [],
    expiringDays: null,
    onlyExpired: false,
  });

  // Estado dos Modais
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ItemWithDetails | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [itemForDetail, setItemForDetail] = useState<ItemWithDetails | null>(null);

  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);
  const [localToEdit, setLocalToEdit] = useState<Local | null>(null);

  const [isAmbienteModalOpen, setIsAmbienteModalOpen] = useState(false);
  const [ambienteToEdit, setAmbienteToEdit] = useState<Ambiente | null>(null);

  const [isContainerModalOpen, setIsContainerModalOpen] = useState(false);
  const [containerToEdit, setContainerToEdit] = useState<Container | null>(null);

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isPrintLabelOpen, setIsPrintLabelOpen] = useState(false);
  const [labelContainerId, setLabelContainerId] = useState<string | undefined>(undefined);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCloudSettingsOpen, setIsCloudSettingsOpen] = useState(false);

  // CARREGAR DADOS DO BANCO DE DADOS
  const loadData = async () => {
    try {
      setLoading(true);
      const [locData, ambData, cntData, catData, tagData, itemsData] = await Promise.all([
        db.getLocais(),
        db.getAmbientes(),
        db.getContainers(),
        db.getCategorias(),
        db.getTags(),
        db.getItensWithDetails(),
      ]);

      setLocais(locData);
      setAmbientes(ambData);
      setContainers(cntData);
      setCategorias(catData);
      setTags(tagData);
      setAllItems(itemsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // REAVALIAR FILTROS SEMPRE QUE MUDAR OS FILTROS OU OS ITENS
  useEffect(() => {
    const applyFilter = async () => {
      const results = await db.getItensWithDetails(filters);
      setFilteredItems(results);
    };
    applyFilter();
  }, [filters, allItems]);

  // HASH ROUTER LISTENER (Para Deep Linking via QR Code ex: #/container/ID)
  useEffect(() => {
    const checkHash = async () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/container/')) {
        const containerId = hash.replace('#/container/', '').split('?')[0];
        if (containerId) {
          const container = containers.find(c => c.id === containerId);
          if (container) {
            const amb = ambientes.find(a => a.id === container.ambiente_id);
            if (amb) {
              setSelectedAmbiente(amb);
              if (amb.local_id) {
                const loc = locais.find(l => l.id === amb.local_id);
                if (loc) setSelectedLocal(loc);
              }
            }
            setSelectedContainer(container);
            setActiveView('spatial');
          }
        }
      }
    };
    if (containers.length > 0) {
      checkHash();
    }
  }, [containers, ambientes, locais]);

  // MANIPULADORES DE SALVAMENTO CRUD
  const handleSaveItem = async (itemData: Omit<Item, 'id'> & { id?: string }, addAnother?: boolean) => {
    await db.saveItem(itemData);
    await loadData();
  };

  const handleDeleteItem = async (itemId: string) => {
    await db.deleteItem(itemId);
    await loadData();
  };

  const handleSaveLocal = async (localData: Omit<Local, 'id'> & { id?: string }) => {
    const saved = await db.saveLocal(localData);
    await loadData();
    setSelectedLocal(saved);
    setSelectedAmbiente(null);
    setSelectedContainer(null);
    setActiveView('spatial');
  };

  const handleDeleteLocal = async (id: string) => {
    if (confirm('Atenção: Excluir este local removerá também todos os ambientes, containers e itens descendentes. Deseja continuar?')) {
      await db.deleteLocal(id);
      setSelectedLocal(null);
      setSelectedAmbiente(null);
      setSelectedContainer(null);
      setActiveView('dashboard');
      await loadData();
    }
  };

  const handleSaveAmbiente = async (ambienteData: Omit<Ambiente, 'id'> & { id?: string }) => {
    const saved = await db.saveAmbiente(ambienteData);
    await loadData();
    if (saved.local_id) {
      const loc = locais.find(l => l.id === saved.local_id);
      if (loc) setSelectedLocal(loc);
    }
    setSelectedAmbiente(saved);
    setSelectedContainer(null);
    setActiveView('spatial');
  };

  const handleDeleteAmbiente = async (id: string) => {
    if (confirm('Atenção: Excluir este ambiente removerá também todos os seus containers e itens descendentes. Deseja continuar?')) {
      await db.deleteAmbiente(id);
      setSelectedAmbiente(null);
      setSelectedContainer(null);
      await loadData();
    }
  };

  const handleSaveContainer = async (containerData: Omit<Container, 'id'> & { id?: string }) => {
    const saved = await db.saveContainer(containerData);
    await loadData();
    const amb = ambientes.find(a => a.id === saved.ambiente_id);
    if (amb) {
      setSelectedAmbiente(amb);
      if (amb.local_id) {
        const loc = locais.find(l => l.id === amb.local_id);
        if (loc) setSelectedLocal(loc);
      }
    }
    setSelectedContainer(saved);
    setActiveView('spatial');
  };

  const handleDeleteContainer = async (id: string) => {
    if (confirm('Atenção: Excluir este container removerá também todos os itens guardados nele. Deseja continuar?')) {
      await db.deleteContainer(id);
      setSelectedContainer(null);
      await loadData();
    }
  };

  // NAVEGAÇÃO ESPACIAL E EVENTOS DE LEITURA QR
  const handleScanQRResult = (containerId: string) => {
    const container = containers.find(c => c.id === containerId);
    if (container) {
      const amb = ambientes.find(a => a.id === container.ambiente_id);
      if (amb) {
        setSelectedAmbiente(amb);
        if (amb.local_id) {
          const loc = locais.find(l => l.id === amb.local_id);
          if (loc) setSelectedLocal(loc);
        }
      }
      setSelectedContainer(container);
      setActiveView('spatial');
    } else {
      alert(`Container com ID "${containerId}" não encontrado.`);
    }
  };

  const handleNavigateToContainerFromSearch = (containerId: string, ambienteId?: string) => {
    if (ambienteId) {
      const amb = ambientes.find(a => a.id === ambienteId);
      if (amb) {
        setSelectedAmbiente(amb);
        if (amb.local_id) {
          const loc = locais.find(l => l.id === amb.local_id);
          if (loc) setSelectedLocal(loc);
        }
      }
    }
    const container = containers.find(c => c.id === containerId);
    if (container) setSelectedContainer(container);
    setActiveView('spatial');
  };

  const handleResetSeedData = () => {
    if (confirm('Recarregar os dados de demonstração padrão? Quaisquer alterações locais serão restauradas para a semente inicial.')) {
      db.resetToSeedData();
      loadData();
      setSelectedLocal(null);
      setSelectedAmbiente(null);
      setSelectedContainer(null);
      setActiveView('dashboard');
    }
  };

  const hasActiveFilters = Boolean(
    filters.searchQuery || filters.localId || filters.ambienteId || filters.containerId || filters.categoriaId || filters.tagIds.length > 0 || filters.expiringDays || filters.onlyExpired
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* Header com Busca Persistente e Ações Rápidas */}
      <Header
        filters={filters}
        onFilterChange={newFilters => {
          setFilters(newFilters);
          if (newFilters.searchQuery || newFilters.localId || newFilters.ambienteId || newFilters.categoriaId || newFilters.tagIds.length > 0 || newFilters.expiringDays || newFilters.onlyExpired) {
            setActiveView('search');
          }
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenItemModal={() => { setItemToEdit(null); setIsItemModalOpen(true); }}
        onOpenContainerModal={() => { setContainerToEdit(null); setIsContainerModalOpen(true); }}
        onOpenAmbienteModal={() => { setAmbienteToEdit(null); setIsAmbienteModalOpen(true); }}
        onOpenLocalModal={() => { setLocalToEdit(null); setIsLocalModalOpen(true); }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenCloudSettings={() => setIsCloudSettingsOpen(true)}
        onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
        onResetSeedData={handleResetSeedData}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Breadcrumbs de Navegação Espacial de 4 Níveis */}
      <Breadcrumbs
        local={selectedLocal}
        ambiente={selectedAmbiente}
        container={selectedContainer}
        onNavigateHome={() => {
          setSelectedLocal(null);
          setSelectedAmbiente(null);
          setSelectedContainer(null);
          setActiveView('dashboard');
        }}
        onNavigateLocal={(loc) => {
          setSelectedLocal(loc);
          setSelectedAmbiente(null);
          setSelectedContainer(null);
          setActiveView('spatial');
        }}
        onNavigateAmbiente={(amb) => {
          setSelectedAmbiente(amb);
          setSelectedContainer(null);
          setActiveView('spatial');
        }}
      />

      {/* Conteúdo Principal da Aplicação */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Carregando inventário...</p>
          </div>
        ) : hasActiveFilters && activeView === 'search' ? (
          /* Visão de Resultados da Pesquisa / Filtros Cruzados */
          <SearchView
            items={filteredItems}
            searchQuery={filters.searchQuery}
            onSelectItem={item => { setItemForDetail(item); setIsDetailModalOpen(true); }}
            onEditItem={item => { setItemToEdit(item); setIsItemModalOpen(true); }}
            onDeleteItem={handleDeleteItem}
            onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
            onNavigateToContainer={handleNavigateToContainerFromSearch}
          />
        ) : selectedContainer && activeView === 'spatial' ? (
          /* Visão Nível 3: Itens guardados em um Container específico */
          <ContainerView
            container={selectedContainer}
            ambiente={selectedAmbiente || undefined}
            items={allItems.filter(i => i.container_id === selectedContainer.id)}
            onBack={() => setSelectedContainer(null)}
            onSelectItem={item => { setItemForDetail(item); setIsDetailModalOpen(true); }}
            onOpenAddItem={() => { setItemToEdit(null); setIsItemModalOpen(true); }}
            onEditItem={item => { setItemToEdit(item); setIsItemModalOpen(true); }}
            onDeleteItem={handleDeleteItem}
            onPrintLabel={cnt => { setLabelContainerId(cnt.id); setIsPrintLabelOpen(true); }}
          />
        ) : selectedAmbiente && activeView === 'spatial' ? (
          /* Visão Nível 2: Containers de um Ambiente específico */
          <ContainerGrid
            ambiente={selectedAmbiente}
            containers={containers.filter(c => c.ambiente_id === selectedAmbiente.id)}
            items={allItems}
            onSelectContainer={cnt => setSelectedContainer(cnt)}
            onOpenAddContainer={() => { setContainerToEdit(null); setIsContainerModalOpen(true); }}
            onEditContainer={cnt => { setContainerToEdit(cnt); setIsContainerModalOpen(true); }}
            onDeleteContainer={handleDeleteContainer}
            onPrintContainerLabel={cnt => { setLabelContainerId(cnt.id); setIsPrintLabelOpen(true); }}
          />
        ) : selectedLocal && activeView === 'spatial' ? (
          /* Visão Nível 1: Ambientes de um Local específico */
          <LocalView
            local={selectedLocal}
            ambientes={ambientes.filter(a => a.local_id === selectedLocal.id)}
            items={allItems}
            onSelectAmbiente={amb => { setSelectedAmbiente(amb); setSelectedContainer(null); }}
            onOpenAddAmbiente={() => { setAmbienteToEdit(null); setIsAmbienteModalOpen(true); }}
            onEditLocal={loc => { setLocalToEdit(loc); setIsLocalModalOpen(true); }}
            onDeleteLocal={handleDeleteLocal}
            onEditAmbiente={amb => { setAmbienteToEdit(amb); setIsAmbienteModalOpen(true); }}
            onDeleteAmbiente={handleDeleteAmbiente}
          />
        ) : (
          /* Visão Inicial: Dashboard & Navegação por Locais (Nível 0) */
          <Dashboard
            locais={locais}
            ambientes={ambientes}
            items={allItems}
            onSelectLocal={loc => {
              setSelectedLocal(loc);
              setSelectedAmbiente(null);
              setSelectedContainer(null);
              setActiveView('spatial');
            }}
            onSelectAmbiente={amb => {
              const loc = locais.find(l => l.id === amb.local_id);
              if (loc) setSelectedLocal(loc);
              setSelectedAmbiente(amb);
              setSelectedContainer(null);
              setActiveView('spatial');
            }}
            onFilterExpiring={days => {
              setFilters({ ...filters, expiringDays: days, onlyExpired: false });
              setActiveView('search');
            }}
            onFilterCategory={catId => {
              setFilters({ ...filters, categoriaId: catId });
              setActiveView('search');
            }}
            onOpenAddLocal={() => { setLocalToEdit(null); setIsLocalModalOpen(true); }}
          />
        )}

      </main>

      {/* MODAIS DA APLICAÇÃO */}

      {/* Modal Formulário de Item */}
      <ItemFormModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        containers={containers}
        categorias={categorias}
        tags={tags}
        initialContainerId={selectedContainer?.id}
        itemToEdit={itemToEdit}
      />

      {/* Modal Detalhes do Item */}
      <ItemDetailModal
        item={itemForDetail}
        onClose={() => { setIsDetailModalOpen(false); setItemForDetail(null); }}
        onEdit={item => { setItemToEdit(item); setIsItemModalOpen(true); }}
        onDelete={handleDeleteItem}
        onNavigatePath={(ambId, cntId) => {
          if (cntId) handleNavigateToContainerFromSearch(cntId, ambId);
        }}
      />

      {/* Modal Formulário de Local */}
      <LocalFormModal
        isOpen={isLocalModalOpen}
        onClose={() => setIsLocalModalOpen(false)}
        onSave={handleSaveLocal}
        localToEdit={localToEdit}
      />

      {/* Modal Formulário de Ambiente */}
      <AmbienteFormModal
        isOpen={isAmbienteModalOpen}
        onClose={() => setIsAmbienteModalOpen(false)}
        onSave={handleSaveAmbiente}
        locais={locais}
        initialLocalId={selectedLocal?.id}
        ambienteToEdit={ambienteToEdit}
      />

      {/* Modal Formulário de Container */}
      <ContainerFormModal
        isOpen={isContainerModalOpen}
        onClose={() => setIsContainerModalOpen(false)}
        onSave={handleSaveContainer}
        ambientes={ambientes}
        initialAmbienteId={selectedAmbiente?.id}
        containerToEdit={containerToEdit}
      />

      {/* Gaveta de Filtros Cruzados */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        locais={locais}
        ambientes={ambientes}
        containers={containers}
        categorias={categorias}
        tags={tags}
      />

      {/* Modal Scanner de QR Code */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanResult={handleScanQRResult}
      />

      {/* Modal Impressão de Etiquetas PDF */}
      <LabelPrintModal
        isOpen={isPrintLabelOpen}
        onClose={() => setIsPrintLabelOpen(false)}
        containers={containers}
        ambientes={ambientes}
        selectedContainerId={labelContainerId}
      />

      {/* Modal Exportação Excel & CSV */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        allItems={allItems}
        filteredItems={filteredItems}
      />

      {/* Modal Configurações do Supabase Nuvem */}
      <CloudSettingsModal
        isOpen={isCloudSettingsOpen}
        onClose={() => setIsCloudSettingsOpen(false)}
        onCredentialsSaved={loadData}
      />

    </div>
  );
}
