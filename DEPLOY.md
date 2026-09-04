# Deploy do frontend Beco Underground

Painel no ar [https://demo.raulnikroyce.dev/](https://demo.raulnikroyce.dev/)

1. No Vercel, conecte `frontend-beco-underground`. Build `npm run build`. Output `dist`.
2. Em **Environment**, cadastre a variável abaixo.

```
VITE_API_URL=https://api-beco-underground.onrender.com
```

3. Na API (Render), `CORS_ORIGIN` deve incluir painel e loja:

```text
https://demo.raulnikroyce.dev,https://ingressosbeco.raulnikroyce.dev
```

Loja de ingressos (repo `frontend-beco-ingressos`): https://ingressosbeco.raulnikroyce.dev

No build de produção, `VITE_API_URL` deve apontar para a API no Render. Se a variável for omitida, o painel usa `https://api-beco-underground.onrender.com` como fallback seguro; `localhost` é usado somente pelo proxy do Vite em desenvolvimento.

Build local de conferência.

```bash
VITE_API_URL=https://api-beco-underground.onrender.com npm run build
```
