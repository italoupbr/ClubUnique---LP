# Contrato Upsend — Homepage Advisor Elite Club

Este documento é a **fonte de verdade** para qualquer geração ou edição de `index.html` (Site Studio, Cursor, ou manual).  
Se o HTML não cumprir este contrato, **não publique** — a auditoria Upsend bloqueia.

## Auditoria Upsend (obrigatório)

| Regra | Seletor | O que valida |
|-------|---------|--------------|
| Geo-answer | `#geo-answer` ou `.geo-answer` | Entidade + cidade + categoria nas **primeiras 60 palavras visíveis** do `<body>` |
| Prova social | `#prova_social` ou `.prova-social` | Seção de prova social presente na homepage |

Validar antes de commit/deploy:

```bash
node scripts/validate-upsend-homepage.mjs "LP Unique/index.html"
```

---

## 1. Bloco geo-answer (obrigatório)

### Onde
- Dentro do hero, **antes do `<h1>`**, como primeiro parágrafo de conteúdo editorial.
- Classe **e** id obrigatórios: `class="geo-answer" id="geo-answer"`.

### Conteúdo (tokens fixos Advisor Elite Club)

> Desde a edição de 12/12/2026 a marca é **Advisor Elite Club** (antes: Club Unique) e a cidade é **Belo Horizonte**. Os tokens ficam no topo de `scripts/validate-upsend-homepage.mjs`.

| Token | Valor obrigatório |
|-------|-------------------|
| **Entidade** | `Advisor Elite Club` |
| **Categoria** | `evento empresarial exclusivo` (ou `encontro empresarial exclusivo`) |
| **Cidade** | `Belo Horizonte` |

### Template (copiar estrutura, não improvisar)

```html
<p class="geo-answer" id="geo-answer">
  O <strong>Advisor Elite Club</strong> Experience Edition é um <strong>evento empresarial exclusivo</strong> em <strong>Belo Horizonte</strong> que reúne empresários, decisores, investidores e grandes players do mercado.
</p>
```

### Regras
- Entidade, categoria e cidade devem aparecer **literalmente** (case-insensitive).
- O parágrafo geo-answer deve estar entre as **primeiras 60 palavras** do texto visível do body (ignora nav com 1–2 palavras).
- Não substituir por meta description, JSON-LD ou alt de imagem — tem que ser **HTML visível**.

---

## 2. Seção prova social (obrigatório)

### Onde
- Após `#porque` (ou equivalente “Por que participar”).
- Antes de `#investimento` / fechamento / convite.

### Seletores (usar ambos)

```html
<section id="prova_social" class="prova-social">
```

### Conteúdo mínimo (4 itens factuais)

1. **Edições realizadas** — julho, agosto e outubro de 2026.
2. **Próximo encontro** — 12 de dezembro de 2026, Belo Horizonte.
3. **Público** — empresários, decisores e investidores; convite exclusivo.
4. **Condução** — Daniel Salomão + especialistas convidados.

### Template estrutural

```html
<section id="prova_social" class="prova-social">
  <div class="container">
    <span class="micro-label">Quem participa</span>
    <h2>Prova social</h2>
    <div class="prova-social-grid">
      <div class="prova-social-item">
        <span class="micro-label">Edição anterior</span>
        <p><strong>Julho de 2026</strong> …</p>
      </div>
      <!-- + 3 itens -->
    </div>
  </div>
</section>
```

---

## 3. Ordem de seções (homepage Upsend)

1. Nav  
2. Hero (com **geo-answer** + h1 + CTA)  
3. `#quando` — data / local / acesso  
4. `#proposito` — manifesto  
5. `#experiencia` — “Aqui você encontrará”  
6. `#porque` — negócios + família  
7. **`#prova_social`** ← obrigatório  
8. `#investimento` — convite / CTA final  
9. Footer  

---

## 4. Prompt fixo (Site Studio / geradores)

Incluir **sempre** no prompt de geração:

```
CONTRATO UPSEND (obrigatório, não omitir):
1. Inserir <p class="geo-answer" id="geo-answer"> no hero ANTES do h1, com:
   - Entidade: Advisor Elite Club
   - Categoria: evento empresarial exclusivo
   - Cidade: Belo Horizonte
2. Inserir <section id="prova_social" class="prova-social"> antes do fechamento/convite,
   com edições realizadas, próxima edição (12/12/2026, Belo Horizonte), público e Daniel Salomão.
3. Validar: node scripts/validate-upsend-homepage.mjs
Referência: docs/UPsend-HOMEPAGE-CONTRACT.md e templates/homepage-upsend.reference.html
```

---

## 5. Referência implementada

Arquivo canônico que **passa** na auditoria:

`templates/homepage-upsend.reference.html`

Qualquer nova versão deve manter os seletores `#geo-answer` e `#prova_social` mesmo que o visual mude.
