# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

Uma família que administra o próprio negócio e divide **um único tablet Android** entre três pessoas (os "responsáveis"). As idades e a familiaridade com tecnologia variam entre elas, e o uso é informal, no ritmo do dia a dia do negócio. O trabalho delas é:

- registrar o que entra (recebimentos de clientes) e o que sai (despesas);
- manter clientes e fornecedores cadastrados;
- saber quanto cada cliente ainda deve;
- conferir, por período, se o negócio teve lucro ou prejuízo;
- ver quem fez cada alteração.

## Product Purpose

O GFinance (antes chamado ProFin) centraliza o controle financeiro do negócio num lugar só, para os três responsáveis, com rastreabilidade: toda inclusão ou edição fica registrada com quem fez, o que fez e quando. O sucesso é a família lançar e consultar tudo pelo tablet com poucos toques, confiar que o que aparece como salvo foi mesmo gravado, e responder "quanto entrou, quanto saiu e quem mexeu" sem planilha nem caderno.

## Positioning

É uma ferramenta feita para **um dispositivo compartilhado por uma família**, não um app pessoal nem um ERP. A identidade é por operação: antes de cada alteração, o app pergunta "Quem vai fazer essa alteração?" e mostra três botões grandes com os nomes. A escolha nunca fica guardada (RF07–RF09). Consultas e relatórios não pedem identificação. O app só declara sucesso depois que o servidor confirma a gravação (RF14).

## Operating Context

- O tablet é compartilhado e tem bloqueio de tela. Escolher um nome é rastreabilidade operacional, não prova de identidade. Um PIN individual é opcional e ainda não foi adotado (RNF09).
- Orientação: **em aberto**. O uso real (deitado no balcão ou na mão) ainda não foi definido. O app deve funcionar em retrato e paisagem (`orientation: default`).
- Os dados ficam num servidor: app → HTTPS → API REST (Java/Spring Boot) → MySQL. O app nunca acessa o banco diretamente (RF13, RNF03).
- A hospedagem pode ser gratuita e suspender por inatividade. A falta de conexão é uma situação comum e esperada (RNF08).
- A entrega é por instalação direta de APK, sem Play Store (RNF01).
- Equipe: a Pessoa A cuida do backend e a Pessoa B do app. É um projeto acadêmico do curso de ADS para um negócio real.

## Capabilities and Constraints

- **Módulos:**
  - Clientes: cadastro, consulta, edição e valor pendente abaixo do nome; R$ 0,00 quando não há pendência.
  - Recebimentos: vinculados a um cliente.
  - Fornecedores: sem controle de pendências.
  - Saídas/despesas: sem controle de pendências.
  - Relatórios por período: total de recebimentos, total de saídas e resultado, que pode ser negativo.
  - Histórico: somente leitura, do mais recente para o mais antigo.
- **Termos do produto** (usar sempre estes): responsável, entrada (nas telas; o código e a API ainda usam "recebimento"), saída, valor pendente, resultado, histórico, "Quem vai fazer essa alteração?".
- **Dinheiro:** valores em BRL ("R$ 1.234,56"), calculados pelo backend com DECIMAL. O app não recalcula totais oficiais. Datas aparecem como dd/mm/aaaa.
- **Estados obrigatórios em toda tela:** carregando, lista vazia, erro com "Tentar novamente" e confirmação (RNF05).
- **Gravações:** nunca são repetidas automaticamente. Se a conexão cair durante o envio, a mensagem manda conferir a lista antes de tentar de novo.
- **Stack fixa (RNF02):** React Native + Expo + TypeScript + Expo Router. Sem novas dependências sem decisão explícita.
- **Ainda não decidido pela equipe:** campos extras de cliente e fornecedor, regra de cobrança do "total a receber" e adoção de PIN.

## Brand Commitments

- O nome **GFinance** é fixo.
- As cores do tema atual (verde e amarelo) **não** são compromisso: podem mudar num redesenho.
- Nunca usar nomes reais de pessoas, clientes ou responsáveis, valores reais, URLs ou IPs em código, telas de exemplo ou documentação. Exemplos usam "Responsável 1, 2 e 3" e "Cliente Teste".

## Evidence on Hand

- Requisitos completos (RF01–RF14, RU01–RU05, RNF01–RNF09) num documento mantido fora do repositório.
- Contrato da API: `mobile/src/services/contrato.ts`.
- Dados fictícios: `mobile/src/services/mockApi.ts`.
- Não existem logotipo final, depoimentos, métricas de uso nem capturas reais, e nada disso deve ser inventado.

## Product Principles

1. **Poucos toques, botões grandes.** Toda operação frequente (lançar, cadastrar, editar) termina rápido e cabe no toque de qualquer um dos três (RU04, RNF05).
2. **Nunca mentir sobre o estado.** Sucesso só depois da confirmação do servidor. Falha nunca aparece como concluída, e números nunca são inventados quando a API não responde.
3. **Quem fez fica claro.** A identificação é por operação, rápida e nunca reaproveitada. O histórico responde "quem mexeu" sem ambiguidade.
4. **Português claro, sem jargão.** As mensagens dizem o que aconteceu e o que fazer em seguida.
5. **Consultar é livre.** Ver listas, relatórios e histórico nunca exige identificação nem passos extras.

## Accessibility & Inclusion

- Pessoas de idades e familiaridade com tecnologia diferentes usam o mesmo aparelho. Alvos de toque grandes (o tema usa 56 dp), texto base de pelo menos 18 pt e boa legibilidade em retrato e em paisagem.
- Lucro e prejuízo, erro e sucesso nunca são indicados só por cor: sempre há texto junto.
- Leitor de tela (TalkBack): controles e gráficos com rótulos descritivos.
