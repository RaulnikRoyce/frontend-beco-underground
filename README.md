# Frontend Beco Underground

Painel Vue para produção de eventos: cronograma, artistas e custos.

**Demo:** [https://gestaobeco.netlify.app/](https://gestaobeco.netlify.app/)  
**API:** [api-beco-underground](https://github.com/RaulnikRoyce/api-beco-underground) · **Painel:** este repositório

Produção: este Vue no Netlify, API no Render, MySQL na Aiven.

## Sobre este projeto

Este repositório faz parte de um **projeto pessoal de estudo**. O objetivo é treinar engenharia de software em um problema real da minha atuação como **promotor de eventos**: ver a noite inteira num relance — cronograma, quem sobe e quanto custa.

O Beco Underground nasceu **solo**: telas, fluxos e o primeiro código foram definidos e escritos por mim. **Perto do final**, usei o [Cursor](https://cursor.com) só como **auxílio estratégico** (decisões de fechamento, deploy e polimento) para concluir o projeto — não como autor da ideia nem do desenho inicial.

## Por quê

Quem produz o Sábado Maldito precisa ver a noite inteira num relance: próximo evento, custo de cachê, quem sobe e a que horas. O Vue não substitui a API — ele só organiza o que a API já decide.

## Stack

Vue 3 · Vite · Pinia · Vue Router · Tailwind CSS · Axios

## Subir local

Com a API rodando em `http://localhost:3000`:

```bash
npm install
npm run dev
```

Abra o endereço que o Vite mostrar (`5173` ou `5174`). Em desenvolvimento as chamadas `/auth`, `/eventos`, `/bandas` e `/lineup` são encaminhadas à API.

Login local: use a conta criada com `npm run seed:admin` na API (valores no `.env` dela). Depois do primeiro login, **Trocar senha** no perfil (barra lateral). Em produção, crie uma conta de produtor em `/cadastro` — não use a senha do seed no ar.

## Telas

- `/login` — acesso
- `/cadastro` — conta de produtor
- `/p/:token` — página da banda (sem login)
- `/` — resumo e calendário
- `/eventos` — lista e cadastro
- `/eventos/:id` — lineup, impressão e link da banda
- `/artistas` — catálogo e cachê base
- `/equipe` — admin: ativar, bloquear, redefinir senha de **outro** usuário e excluir produtores

Qualquer logado troca a **própria** senha no perfil (precisa da senha atual). Não há “esqueci minha senha”: o admin redefine a dos outros na Equipe; a própria conta só pelo perfil.

Admin escala artistas e cadastra o catálogo. Produtor vê tudo, cria eventos e só apaga os que criou.

## Qualidade

```bash
npm test
npm run lint
npm run build
```

## Produção

No Netlify, `VITE_API_URL=https://api-beco-underground.onrender.com`. Detalhes em [DEPLOY.md](./DEPLOY.md).
