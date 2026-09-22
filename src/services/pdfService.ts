import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Container, Ambiente } from '../types/inventory';

export interface LabelData {
  container: Container;
  ambiente?: Ambiente;
}

export async function generateContainerLabelsPDF(labels: LabelData[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const cols = 2;
  const cardWidth = (pageWidth - margin * 2 - 10) / cols; // ~90mm
  const cardHeight = 65; // 65mm por etiqueta
  const rowsPerPage = 4; // 8 etiquetas por página A4

  let x = margin;
  let y = margin;
  let count = 0;

  for (const label of labels) {
    if (count > 0 && count % (cols * rowsPerPage) === 0) {
      doc.addPage();
      x = margin;
      y = margin;
    }

    const colIndex = count % cols;
    const rowIndex = Math.floor((count % (cols * rowsPerPage)) / cols);

    x = margin + colIndex * (cardWidth + 10);
    y = margin + rowIndex * (cardHeight + 10);

    // Desenhar Borda do Cartão da Etiqueta
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(252, 252, 252);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');

    // Cabeçalho da Etiqueta (Marca)
    doc.setFillColor(2, 132, 199); // Azul Brand
    doc.rect(x, y, cardWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('INVENTÁRIO DOMÉSTICO', x + 5, y + 5.5);

    // Gerar QR Code em Data URL
    const qrTargetUrl = `${window.location.origin}/#/container/${label.container.id}`;
    const qrDataUrl = await QRCode.toDataURL(qrTargetUrl, {
      margin: 1,
      width: 250,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    // Inserir Imagem QR Code (Tamanho legível: 35mm x 35mm)
    const qrSize = 35;
    const qrX = x + 5;
    const qrY = y + 14;
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Detalhes Textuais (Identificação Humana)
    const textX = x + 44;
    let textY = y + 18;

    // Nome do Ambiente (Local Superior)
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('AMBIENTE:', textX, textY);

    textY += 4.5;
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const ambienteNome = (label.ambiente?.nome || 'Residência').toUpperCase();
    doc.text(ambienteNome.substring(0, 22), textX, textY);

    // Nome do Container
    textY += 7;
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTAINER / MÓVEL:', textX, textY);

    textY += 5;
    doc.setTextColor(2, 132, 199); // Azul Destaque
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const containerNome = label.container.nome;
    const splitContainer = doc.splitTextToSize(containerNome, cardWidth - 48);
    doc.text(splitContainer, textX, textY);

    // ID do Container / Instrução de Leitura
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${label.container.id.substring(0, 18)}...`, x + 5, y + 54);
    doc.text('Escaneie com a câmera para abrir', textX, y + 54);

    count++;
  }

  doc.save(`etiquetas_containers_${new Date().toISOString().split('T')[0]}.pdf`);
}
