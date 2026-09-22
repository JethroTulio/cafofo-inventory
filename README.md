# 🏠 Cafofo Inventory
> **Gestão Inteligente e Sincronizada de Inventário Doméstico**  
> *powered by **Tull_LAB***

[![Deploy Page](https://github.com/JethroTulio/cafofo-inventory/actions/workflows/deploy.yml/badge.svg)](https://github.com/JethroTulio/cafofo-inventory/actions/workflows/deploy.yml)
[![Live App](https://img.shields.io/badge/Live%20App-GitHub%20Pages-indigo?style=flat&logo=github)](https://jethrotulio.github.io/cafofo-inventory/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-emerald?style=flat&logo=supabase)](https://supabase.com)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-blue?style=flat&logo=react)](https://react.dev)

---

## 📌 Visão Geral

O **Cafofo Inventory** é uma aplicação web moderna e responsiva focada na organização doméstica, controle patrimonial e rastreabilidade espacial de objetos. Ele permite mapear residências, escritórios e propriedades em **4 Níveis Espaciais** estruturados:

$$\text{Locais (Imóveis)} \longrightarrow \text{Ambientes (Cômodos)} \longrightarrow \text{Containers (Organizadores)} \longrightarrow \text{Itens (Objetos)}$$

O aplicativo oferece **sincronização bidirecional em tempo real com nuvem Supabase (PostgreSQL)**, suporte a funcionamento **100% offline** (fallback LocalStorage), leitor e gerador de **QR Codes**, etiquetas em PDF, gráficos financeiros e controle automático de validade.

---

## ✨ Principais Funcionalidades

- 🏢 **Hierarquia Espacial de 4 Níveis**: Organize seus objetos por Imóvel (Local), Cômodo (Ambiente), Móvel/Caixa (Container) e Sub-localização física (ex: *Gaveta 2*).
- ☁️ **Sincronização em Nuvem (Supabase)**: Conecte seu próprio banco de dados PostgreSQL no Supabase com 1 clique para acessar seus itens de qualquer dispositivo via 4G/5G ou Wi-Fi.
- 📸 **Otimização Automática de Fotos**: As imagens tiradas pela câmera do celular ou enviadas por arquivo são redimensionadas no navegador via HTML5 Canvas (max 800px, ~90KB) para sincronização ultrarrápida.
- 📱 **Interface Mobile-First**: Painel otimizado para celulares com cards totalizadores compactos e acesso direto aos cômodos com 1 toque.
- 📷 **Leitor & Gerador de QR Code**: Escaneie etiquetas físicas com a câmera do celular para abrir a localização exata de um container ou item.
- 🖨️ **Exportação de Etiquetas em PDF**: Gerador integrado de folhas de etiquetas prontas para impressão e colagem em caixas e organizadores.
- 📊 **Dashboard Financeiro & Alertas**: Gráficos de valor acumulado por categoria/local e controle visual de itens vencidos ou próximos do vencimento.
- 📥 **Exportação de Dados**: Exporte todo o seu inventário para planilhas **Excel (.xlsx)** e arquivos **CSV**.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend Core**: React 19, TypeScript, Vite
- **Estilização**: Tailwind CSS, Lucide React Icons
- **Banco de Dados & Nuvem**: Supabase JS Client (`@supabase/supabase-js`), PostgreSQL
- **Gráficos & Visualizações**: Recharts
- **PDF & Impressão de Etiquetas**: jsPDF, html2canvas
- **Manipulação de Planilhas**: XLSX (SheetJS)
- **Scanner de QR Code**: html5-qrcode

---

## 🗄️ Estrutura do Banco de Dados (Supabase / PostgreSQL)

O repositório inclui a estrutura SQL pronta em `supabase/schema.sql`. As principais tabelas são:

```sql
locais (id UUID, nome, descricao, foto_url)
  └── ambientes (id UUID, local_id UUID, nome, descricao, foto_url)
        └── containers (id UUID, ambiente_id UUID, nome, foto_url)
              └── itens (id UUID, container_id UUID, categoria_id UUID, nome, sub_localizacao, preco, quantidade, data_validade, foto_url)

categorias (id UUID, nome, icone, cor)
tags (id UUID, nome, cor)
item_tags (item_id UUID, tag_id UUID)
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Passo a Passo

1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/JethroTulio/cafofo-inventory.git
   cd cafofo-inventory
   ```

2. **Instalar as Dependências**:
   ```bash
   npm install
   ```

3. **Iniciar o Servidor de Desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse a aplicação em `http://localhost:3000`.

4. **Gerar a Build de Produção**:
   ```bash
   npm run build
   ```

---

## ⚙️ Configuração do Supabase (Opcional)

1. Crie um projeto gratuito em [Supabase.com](https://supabase.com).
2. Acesse o **SQL Editor** no painel do Supabase e execute o script contido no arquivo [`supabase/schema.sql`](./supabase/schema.sql).
3. No **Cafofo Inventory**, clique no ícone de **Nuvem ☁️** no cabeçalho e insira a **URL do Projeto** e a **Anon Key**.
4. Clique em **⚡ Sincronizar Arquivos e Dados Locais Agora**.

---

## 📦 Deploy Automático (GitHub Pages)

O projeto está configurado com um fluxo de CI/CD automatizado via GitHub Actions (`.github/workflows/deploy.yml`). A cada `push` na branch `main`, a aplicação é compilada e publicada automaticamente na URL pública:

👉 **[https://jethrotulio.github.io/cafofo-inventory/](https://jethrotulio.github.io/cafofo-inventory/)**

---

## 👨‍💻 Créditos & Desenvolvimento

Desenvolvido por **Jethro Túlio**  
Empresa / Laboratório: **Tull_LAB**  
Licença: MIT
