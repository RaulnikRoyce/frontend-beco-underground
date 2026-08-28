# Deploy do frontend Beco Underground

Painel no ar [https://gestaobeco.netlify.app/](https://gestaobeco.netlify.app/)

1. No Netlify, conecte `frontend-beco-underground`. Build `npm run build`. Publish `dist`.
2. Em **Environment**, cadastre a variável abaixo.

```
VITE_API_URL=https://api-beco-underground.onrender.com
```

3. Na API (Render), `CORS_ORIGIN` deve ser exatamente `https://gestaobeco.netlify.app`.

No build de produção, `VITE_API_URL` precisa apontar para a API no Render. Valor omitido deixa o painel falando com `localhost:3000`.

Build local de conferência.

```bash
VITE_API_URL=https://api-beco-underground.onrender.com npm run build
```
