# Club Unique · Experience Edition

Landing page estática do Club Unique Experience Edition.

**Live:** [club-unique-lp.vercel.app](https://club-unique-lp.vercel.app)

## Estrutura

O site fica em `LP Unique/` (raiz do deploy na Vercel).

```
LP Unique/
├── index.html
├── check-in.html
├── admin.html
├── css/styles.css
├── js/
├── assets/
└── supabase/migration.sql
```

## Páginas

| Página | Caminho |
|--------|---------|
| Landing | `/` |
| Check-in | `/check-in` |
| Admin | `/admin` |

## Supabase

1. Execute `LP Unique/supabase/migration.sql` no SQL Editor do projeto.
2. Confirme a anon key em `LP Unique/js/supabase-config.js`.

## Desenvolvimento local

```bash
cd "LP Unique"
python3 -m http.server 5500
```

Abrir [http://localhost:5500](http://localhost:5500) (não abrir o HTML direto no navegador).

## Git

```bash
git pull origin main
# ... editar arquivos em LP Unique/ ...
git add .
git commit -m "sua mensagem"
git push origin main
```

## Contrato Upsend (Site Studio)

Toda homepage deve passar na auditoria Upsend **antes** de publicar.

```bash
node scripts/validate-upsend-homepage.mjs "LP Unique/index.html"
```

Documentação: [`docs/UPsend-HOMEPAGE-CONTRACT.md`](docs/UPsend-HOMEPAGE-CONTRACT.md)  
Referência que passa na auditoria: [`templates/homepage-upsend.reference.html`](templates/homepage-upsend.reference.html)

