# Escopo do Projeto — Atividade A2 (Front-End)

## 1. Identificação

- **Nome da equipe:** Equipe Esporte Sem Limites
- **Nome do projeto/site:** Esporte Sem Limites
- **Integrantes:**
 Vinicius Rodrigo Silva
Vinicius Pina Ferreira
Kauã Molina Pereira Leão
Miguel Expedito Ovidio dos Santos
Pedro Alexandre de Oliveira Rocha
- **Data:** 25/09/2026
- **Professor/disciplina:** Paulo Sérgio Fratta Junior

## 2. Contexto e Justificativa

O site aborda o **esporte adaptado** — modalidades esportivas ajustadas em
regras, equipamentos ou espaço para pessoas com deficiência física, sensorial
ou intelectual, como o paratletismo, o goalball, o boccia e o basquete em
cadeira de rodas.

O tema é relevante porque une três frentes: **inclusão social** (acesso de
pessoas com deficiência a esporte e competição), **sustentabilidade**
(materiais reciclados em próteses e cadeiras esportivas) e **impacto
social** (clubes que geram renda e emprego e melhoram a mobilidade urbana).

A relação com o eixo obrigatório da atividade — sustentabilidade e impacto
social — está na proposta central do site: mostrar esporte adaptado também
como pauta ambiental e social, não só esportiva.

## 3. Objetivos

**Geral:** apresentar o esporte adaptado de forma simples e acessível,
conectando o tema a sustentabilidade e impacto social.

**Específicos:**
1. Publicar 10 páginas HTML5 simples, semânticas e interligadas.
2. Explicar o que é esporte adaptado e por que ele importa logo na home.
3. Disponibilizar um formulário de contato validado em `contato.html`.
4. Usar `alt` em imagens, boa hierarquia de títulos (`h1` a `h3`) e
   `lang="pt-BR"` em todas as páginas.
5. Validar todas as páginas no W3C Validator antes da entrega final.

## 4. Público-Alvo

- Estudantes, torcedores e curiosos que querem entender o esporte adaptado.
- Pessoas com deficiência (PCD) e famílias interessadas no tema —
  **público prioritário**, considerado desde a home page.
- Educadores e gestores interessados em inclusão e esporte.
- Faixa etária: a partir de 14 anos; público nacional (Brasil).

## 5. Escopo Funcional (o que o site terá)

| Página | Função |
|---|---|
| `index.html` | Resumo do tema, apresentação do projeto, menu principal | 
| `sobre.html` | História, missão, visão e valores |
| `projetos.html` | Projetos de esporte adaptado em destaque |
| `impacto.html` | Dados, tabelas e resultados |
| `acessibilidade.html` | Medidas de inclusão para PCD |
| `galeria.html` | Imagens com legendas e fontes |
| `midia.html` | Vídeo, áudio e conteúdo incorporado (iframe) |
| `noticias.html` | Notícias, artigos ou blog sobre o tema |
| `contato.html` | Dados fictícios, formulário validado e membros da equipe |
| `orcamento_hospedagem.html` | Relatório comparativo de hospedagem e domínio |

A home (`index.html`), já entregue, usa `header` (título + `nav` com o
menu principal), `main` com duas `section` — uma explicando o tema e outra
com três `article` (Inclusão, Sustentabilidade, Impacto social) — e um
`footer` simples. As demais páginas seguirão a mesma estrutura básica.

## 6. Escopo Não Funcional

- **Acessibilidade:** hierarquia correta de `h1` a `h3`, `lang="pt-BR"`,
  contraste de cor adequado (texto escuro sobre fundo claro, cabeçalho e
  rodapé escuros com texto branco) e `alt` descritivo assim que imagens
  forem incluídas nas próximas páginas.
- **Sustentabilidade:** conteúdo educativo sobre o tema, escolha de
  hospedagem com política ambiental (ver `orcamento_hospedagem.html`),
  CSS enxuto e sem dependências externas.
- **Responsividade:** o conteúdo é fluido (container com `max-width` e
  elementos que se ajustam à largura da tela); ajustes finos por
  breakpoints (`@media`) serão adicionados nas próximas entregas.
- **Desempenho:** um único arquivo CSS simples, sem bibliotecas externas
  e sem JavaScript nesta etapa — a página carrega rápido.
- **SEO básico:** `<title>` único por página e hierarquia correta de
  títulos.

## 7. Mapa do Site

```
index.html (Início)
 ├── sobre.html
 ├── projetos.html
 ├── impacto.html
 ├── acessibilidade.html
 ├── galeria.html
 ├── midia.html
 ├── noticias.html
 ├── contato.html
 └── orcamento_hospedagem.html
```

Todas as páginas são acessíveis a partir do menu principal, presente no
`header` de `index.html` e replicado em todas as demais páginas.

## 8. Conteúdo e Identidade Visual

- **Tom de voz:** simples, direto e respeitoso — explica o tema sem
  jargão técnico e sem estereótipos sobre deficiência.
- **Cores:** fundo claro (`#f4f4f4`), cartões em branco, cabeçalho e
  rodapé em azul-marinho (`#17233b`) com texto branco, e um destaque em
  laranja (`#ff5c39`) usado nos links em foco e na borda dos `article`.
- **Tipografia:** fonte padrão do sistema (`Arial, sans-serif`), sem
  fontes externas — mantém o carregamento leve e simples.
- **Logotipo:** por enquanto, apenas o nome do site em texto (`h1` no
  cabeçalho); um símbolo gráfico pode ser adicionado em uma entrega
  futura.
- **Fontes de imagens e textos:** conteúdo textual é autoral, escrito
  para esta atividade. Imagens usadas em `galeria.html` e `midia.html`
  terão a fonte creditada na própria página.

## 9. Tecnologias e Ferramentas

- **Linguagens:** HTML5 e CSS3. Sem JavaScript nesta etapa — pode ser
  adicionado depois, já que é opcional na atividade.
- **Editor:** VS Code.
- **Controle de versão:** Git/GitHub.
- **Validação:** W3C Markup Validator (HTML) e W3C CSS Validator.

## 10. Cronograma e Divisão de Tarefas

| Etapa | Entrega | Responsável |
|---|---|---|
| Escopo do projeto + `index.html`/`style.css` | Entrega 01 | Vinicius Pina |
| `sobre.html`, `projetos.html`, `impacto.html` | Entrega 02 | Kauã Molina |
| `acessibilidade.html`, `galeria.html`, `midia.html` | Entrega 03 | Miguel Ovidio |
| `noticias.html`, `contato.html`, `orcamento_hospedagem.html` | Entrega 04 | Pedro Alexandre |
| Validação W3C, testes de acessibilidade, documentação final | Entrega final | Vinicius Rodrigo Silva |


## 11. Riscos e Restrições

- Prazo curto para produzir conteúdo de qualidade sobre um tema que exige
  cuidado de linguagem (deficiência e inclusão).
- Risco de imagens sem licença de uso — mitigado priorizando bancos de
  imagens gratuitos com crédito.
- Dependência de todos os integrantes entregarem sua página na data
  combinada, já que o menu principal é compartilhado entre as páginas.
- Como o CSS ainda não tem breakpoints, o site pode precisar de ajustes
  de responsividade nas próximas entregas.

## 12. Critérios de Aceitação

O site está pronto quando:
- As 10 páginas existem, estão interligadas e navegáveis a partir do
  menu principal.
- O formulário de `contato.html` valida corretamente (campos `required`,
  `email`, `tel`, `date`, `pattern`).
- Todas as páginas passam no W3C Validator sem erros.
- Todas as imagens têm `alt` descritivo e o contraste de texto é adequado.
- A pasta `/docs` contém README, diário de bordo, orçamento de hospedagem
  e evidências de teste.

## 13. Aprovação

- **Responsável pela validação do escopo:** [Vinicius Rodrigo Silva]
- **Data e assinatura:** [25/09/2026 Vinícius Rodrigo]


