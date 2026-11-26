# ProFin — aplicativo Android (mobile)

React Native + Expo + TypeScript + Expo Router.

## Como rodar
1. `npm install`
2. Copie `.env.example` para `.env` e ajuste `EXPO_PUBLIC_API_URL`
   (o `.env` nunca deve ser versionado; use apenas a URL, nunca segredos).
3. `npx expo start`

## Estrutura
- `app/`: telas e rotas (Expo Router)
- `src/components/`: componentes reutilizáveis
- `src/services/api.ts`: acesso a dados (hoje com dados fictícios em memória)
- `src/hooks/`, `src/utils/`, `src/types/`, `src/constants/`

Para testar falhas, ajuste as flags `MOCK_FORCAR_ERRO` e `MOCK_FORCAR_ERRO_RESPONSAVEIS`
em `src/services/api.ts` (devem permanecer `false` ao versionar).