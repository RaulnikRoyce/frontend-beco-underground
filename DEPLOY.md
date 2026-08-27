# Deploy — Frontend Beco Underground

Painel no ar: [https://gestaobeco.netlify.app/](https://gestaobeco.netlify.app/)

1. No Netlify, conecte `frontend-beco-underground`. Build: `npm run build`. Publish: `dist`.
2. Em **Environment**, cadastre:

```
VITE_API_URL=https://api-beco-underground.onrender.com
```

3. Na API (Render), `CORS_ORIGIN` deve ser exatamente `https://gestaobeco.netlify.app`.

Sem `VITE_API_URL`, o build de produção cai em `http://localhost:3000` — não use isso no ar.

Build local de conferência:

```bash
VITE_API_URL=https://api-beco-underground.onrender.com npm run build
```
