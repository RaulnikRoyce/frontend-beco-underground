# Frontend Beco Underground

<img src="public/logo-beco.png" alt="Logo Beco Underground Produções" width="160">

Painel Vue para produção de eventos, cronograma, artistas, custos e ingressos.

**Demo** [https://demo.raulnikroyce.dev/](https://demo.raulnikroyce.dev/) · **Loja** [https://ingressosbeco.raulnikroyce.dev](https://ingressosbeco.raulnikroyce.dev)  
**API** [api-beco-underground](https://github.com/RaulnikRoyce/api-beco-underground) · **Ingressos** [frontend-beco-ingressos](https://github.com/RaulnikRoyce/frontend-beco-ingressos) · **Painel** este repositório

Produção usa este Vue no Vercel, a API no Render e MySQL na Aiven.

## Sobre este projeto

Repositório de um projeto pessoal de estudo. Treino engenharia de software no problema real da produção de eventos, cronograma, quem sobe, quanto custa e venda de ingressos, no mesmo painel.

Eu defini as telas, os fluxos e o primeiro código. No fechamento usei o [Cursor](https://cursor.com) como auxílio em deploy e polimento.

## Por que o Vue

Quem produz o Sábado Maldito precisa do próximo evento, do custo de cachê, de quem sobe com horário e dos lotes na loja. O Vue organiza o que a API já decide.

## Stack

Vue 3 · Vite · Pinia · Vue Router · UnoCSS · Axios

## Subir local

Com a API em `http://localhost:3000`, rode os comandos abaixo.

```bash
npm install
npm run dev
```

Abra o endereço que o Vite mostrar (`5173` ou `5174`). Em desenvolvimento as chamadas `/auth`, `/eventos`, `/bandas`, `/lineup` e `/ingressos` são encaminhadas à API.

Login local usa a conta criada com `npm run seed:admin` na API (valores no `.env` dela). Depois do primeiro login, use **Trocar senha** no perfil (barra lateral). Em produção, crie uma conta de produtor em `/cadastro` e evite a senha do seed.

## Telas

- `/login` acesso
- `/cadastro` conta de produtor
- `/p/:token` página da banda (sem login)
- `/` resumo e calendário
- `/eventos` lista e cadastro
- `/eventos/:id` lineup, impressão, link da banda e aba de ingressos (meta, lotes, vendas, cupons)
- `/artistas` catálogo e cachê base
- `/equipe` admin, ativar, bloquear, redefinir senha de outro usuário e excluir produtores
- `/checkin` validação na porta (admin)

Qualquer logado troca a própria senha no perfil (precisa da senha atual). O admin redefine a dos outros na Equipe e troca a própria só no perfil.

Admin escala artistas, cadastra o catálogo e publica ingressos. Produtor cria eventos e acessa somente os que criou.

## Qualidade

```bash
npm test
npm run lint
npm run build
```

## Produção

No Vercel, `VITE_API_URL=https://api-beco-underground.onrender.com`. Detalhes em [DEPLOY.md](./DEPLOY.md).
