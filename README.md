# Finlumia Frontend

Aplicação [Next.js](https://nextjs.org) (App Router) com React 19 e TypeScript.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor após o build |
| `npm run lint` | ESLint |

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e ajuste as URLs dos serviços (`NEXT_PUBLIC_*`).

## Estrutura

- `src/app/` — rotas e layout (App Router)
- `src/components/` — UI (atomic design)
- `src/shared/` — estilos, tokens e tema
- `src/api/` — catálogo de endpoints
- `public/assets/` — imagens estáticas

## Docker

Imagem de desenvolvimento: `docker/scripts/finlumia_front.Dockerfile` (Node 24 + AlmaLinux).

```bash
# Build
docker build -f docker/scripts/finlumia_front.Dockerfile -t finlumia-front-dev .

# Run (projeto na raiz do repositório)
docker run -it --name finlumia-front \
  -p 3000:3000 \
  -v ${PWD}:/home/finlumia/app \
  finlumia-front-dev bash

# Dentro do container
cd /home/finlumia/app
npm install
npm run dev -- --hostname 0.0.0.0
```
