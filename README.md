# Esportes sem Limites

Site informativo (somente interface/front-end) de uma ONG **fictícia** que promove a **inclusão de pessoas com deficiência no esporte**. Projeto acadêmico.

🔗 **Site publicado (HTTPS):** `https://SEU-USUARIO.github.io/esportes-sem-limites/` ← substitua após o deploy (ver [docs/deploy.md](docs/deploy.md))

![Prévia da página inicial](docs/previews/01-inicio-desktop.png)

## O problema

O Brasil tem **18,6 milhões** de pessoas com deficiência (IBGE, PNAD Contínua 2022), mas faltam informação acessível, locais de prática e equipamentos. O site centraliza informação confiável sobre paradesporto e conecta atletas, voluntários e doadores à ONG.

## Funcionalidades

| Área | O que faz |
|---|---|
| 10 páginas | Início, Sobre, Modalidades, Paradesporto, Eventos, Participe, Doe, Impacto e ODS, Assistente IA, Contato |
| Para a ONG | Inscrição de atleta/voluntário com protocolo, simulador de doação com impacto por valor, agenda de eventos com "Tenho interesse", FAQ pesquisável, formulário de contato, newsletter, transparência |
| IA | Assistente virtual "Tina" (chat com base de conhecimento + recuperação por similaridade) e recomendador de modalidade; pronta para integração com LLM via backend |
| JavaScript | Validação acessível de formulários, rascunho automático, filtros, favoritos, busca no site, contadores animados, máscaras |
| localStorage | Preferências de acessibilidade, rascunhos, inscrições, doações, agenda, favoritos, histórico do chat, compromissos ODS |
| Acessibilidade | WCAG 2.2 AA: teclado, skip link, foco visível, alto contraste, modo claro, fonte até 150%, espaçamento de leitura, pausar animações, VLibras |
| Qualidade | 0 erros no validador W3C (Nu HTML Checker) e 0 violações no axe-core nas 10 páginas |

## Tecnologias

HTML5 semântico · CSS3 (custom properties, grid, flexbox, media queries) · JavaScript puro (ES2017+) · GitHub Pages · GitHub Actions. **Sem frameworks e sem dependências de produção.**

## Estrutura

```
├── index.html … contato.html   # 10 páginas
├── assets/
│   ├── css/style.css            # design system + temas de acessibilidade
│   ├── js/main.js               # interações, validação, localStorage
│   ├── js/ia.js                 # assistente IA e recomendador
│   ├── js/vlibras.js            # tradutor de Libras
│   └── img/favicon.svg
├── docs/                        # documentação e diário de bordo
└── .github/workflows/pages.yml  # validação W3C + deploy automático
```

## Como rodar localmente

> ⚠️ Abra **a pasta do projeto** (a que contém o `index.html`), não a pasta de cima. Se aparecer uma lista de pastas no navegador, o servidor foi iniciado no lugar errado.

**Opção 1 — VS Code + Live Server (mais simples)**
1. No VS Code: *Arquivo → Abrir pasta…* e escolha a pasta `esportes-sem-limites`.
2. Instale a extensão recomendada **Live Server** (o VS Code sugere automaticamente).
3. Clique em **Go Live** no canto inferior direito → abre `http://localhost:5500` já no site.

**Opção 2 — Node.js**
```bash
npm start
```
Acesse `http://localhost:3000`.

**Opção 3 — Python**
```bash
python3 -m http.server 8000
```
Execute **dentro** da pasta do projeto e acesse `http://localhost:8000`.

**Validar HTML/CSS (W3C):** `npm run validar` (requer Java).

## Documentação

Veja a pasta [`/docs`](docs/README.md).
