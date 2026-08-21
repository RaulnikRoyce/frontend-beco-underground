# Deploy — Frontend Beco Underground

1. Build com a URL da API de produção:

```bash
VITE_API_URL=https://api-beco-underground.onrender.com npm run build
```

2. Publique a pasta `dist/` (Netlify, Vercel, GitHub Pages ou o host que preferir).
3. No Render, `CORS_ORIGIN` da API deve incluir exatamente a origem do frontend (ex.: `https://seu-app.netlify.app`).

Sem `VITE_API_URL`, o build de produção cai em `http://localhost:3000` — não use isso no ar.
