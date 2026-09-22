import * as XLSX from 'xlsx';
import { ItemWithDetails } from '../types/inventory';

export function exportInventoryToExcel(items: ItemWithDetails[], filenamePrefix = 'inventario_domestico') {
  const flattenedData = items.map(item => {
    const valorUnitario = Number(item.preco) || 0;
    const qtd = Number(item.quantidade) || 1;
    const valorTotal = valorUnitario * qtd;
    const tagsString = item.tags ? item.tags.map(t => t.nome).join(', ') : '';

    return {
      'Nome do Item': item.nome,
      'Descrição': item.descricao || '',
      'Local': item.local?.nome || 'N/A',
      'Ambiente': item.ambiente?.nome || 'N/A',
      'Container': item.container?.nome || 'N/A',
      'Sub-localização': item.sub_localizacao || '',
      'Categoria': item.categoria?.nome || 'Sem Categoria',
      'Tags': tagsString,
      'Quantidade': qtd,
      'Valor Unitário (R$)': valorUnitario,
      'Valor Total (R$)': valorTotal,
      'Data de Inclusão': item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '',
      'Data de Validade': item.data_validade ? new Date(item.data_validade + 'T00:00:00').toLocaleDateString('pt-BR') : ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(flattenedData);

  // Larguras de colunas formatadas
  const columnWidths = [
    { wch: 30 }, // Nome do Item
    { wch: 40 }, // Descrição
    { wch: 22 }, // Local
    { wch: 20 }, // Ambiente
    { wch: 22 }, // Container
    { wch: 18 }, // Sub-localização
    { wch: 20 }, // Categoria
    { wch: 25 }, // Tags
    { wch: 12 }, // Quantidade
    { wch: 18 }, // Valor Unitário
    { wch: 18 }, // Valor Total
    { wch: 16 }, // Data de Inclusão
    { wch: 16 }  // Data de Validade
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventário');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filenamePrefix}_${dateStr}.xlsx`);
}

export function exportInventoryToCSV(items: ItemWithDetails[], filenamePrefix = 'inventario_domestico') {
  const flattenedData = items.map(item => {
    const valorUnitario = Number(item.preco) || 0;
    const qtd = Number(item.quantidade) || 1;
    const valorTotal = valorUnitario * qtd;
    const tagsString = item.tags ? item.tags.map(t => t.nome).join(', ') : '';

    return {
      'Nome do Item': item.nome,
      'Descrição': item.descricao || '',
      'Local': item.local?.nome || 'N/A',
      'Ambiente': item.ambiente?.nome || 'N/A',
      'Container': item.container?.nome || 'N/A',
      'Sub-localização': item.sub_localizacao || '',
      'Categoria': item.categoria?.nome || 'Sem Categoria',
      'Tags': tagsString,
      'Quantidade': qtd,
      'Valor Unitário (R$)': valorUnitario,
      'Valor Total (R$)': valorTotal,
      'Data de Inclusão': item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '',
      'Data de Validade': item.data_validade ? new Date(item.data_validade + 'T00:00:00').toLocaleDateString('pt-BR') : ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(flattenedData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });

  const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
