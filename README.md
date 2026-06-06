# Ei Harold! • Custo de vida

Aplicação web simples, visual e personalizável para acompanhar custo de vida, gastos pessoais, gastos da empresa, investimentos e despesas anuais em múltiplas visualizações.

Criado por **EiHarold** — [eiharold.com](https://eiharold.com)

---

## Sobre o projeto

O **Ei Harold! • Custo de vida** nasceu como uma alternativa mais visual, prática e agradável a uma planilha tradicional de gastos.

A ideia principal é ter uma visão ampla do custo de vida logo de cara, sem precisar navegar por muitas abas ou fórmulas. O app organiza os gastos em colunas compactas, mostra estatísticas importantes no topo e também oferece uma aba de gráficos para análise visual.

O projeto foi pensado para uso pessoal, mas pode ser adaptado para qualquer pessoa que queira controlar melhor seus custos recorrentes, assinaturas, despesas anuais, gastos de empresa e investimentos.

---

## Principais funcionalidades

- Login real com Firebase Authentication por e-mail e senha.
- Múltiplas views/tabelas, como:
  - `Custo de Vida 2026.1`
  - `Custo de Vida 2026.2`
  - `Custo de Vida 2027`
- Gerenciamento de views:
  - criar nova view
  - editar nome inline
  - duplicar view
  - excluir view
  - importar dados
  - exportar dados
  - resetar view atual
- Organização dos gastos por grupos:
  - gastos mensais fixos
  - gastos mensais variáveis
  - gastos da empresa
  - investimentos
  - gastos anuais
- Cadastro e edição de itens com:
  - nome
  - tipo de gasto
  - recorrência mensal ou anual
  - categoria
  - valor
  - forma de pagamento
  - mês de renovação
  - marcação de item essencial
- Preview visual do item antes de salvar.
- Indicadores gerais:
  - mensal essencial
  - mensal completo
  - crédito
  - débito
  - empresa
  - investimentos
  - parcela anual
  - anual total
- Aba de gráficos com visualizações para:
  - custo mensal por grupo
  - mensal essencial x completo
  - pagamento
  - composição mensal
  - renovações anuais
  - maiores gastos
- Salvamento no Firestore quando o Firebase está ativo.
- Cache/fallback local usando `localStorage`.

---

## Como usar localmente

1. Baixe ou clone este repositório.
2. Inicie um servidor local na pasta do projeto:

```bash
python3 -m http.server 8000
```

3. Acesse `http://localhost:8000` no navegador.
4. Sem Firebase configurado, faça login com qualquer e-mail e senha preenchidos.
5. Com Firebase configurado, use o e-mail e senha criados em **Authentication > Users**.
6. Use o seletor de views para alternar entre suas tabelas.
7. Clique em **Novo item** para adicionar um gasto.
8. Clique em uma linha da tabela para editar ou remover um gasto.

Não é necessário instalar dependências nem rodar build.

Importante: após a integração com Firebase, não abra o app diretamente pelo arquivo `index.html`. Navegadores modernos podem bloquear módulos JavaScript e imports do Firebase em URLs `file://`, fazendo o botão de login parecer sem ação.

---

## Estrutura dos arquivos

```txt
.
├── index.html      # Estrutura da aplicação
├── styles.css      # Estilos visuais, responsividade e identidade
├── app.js          # Lógica da aplicação, views, dados, gráficos e modal
├── firebase-config.js # Conector real com Firebase Auth e Firestore
├── firebase-env.example.js # Modelo da configuração local do Firebase
├── firestore.rules # Regras de segurança do Firestore
├── firebase.json   # Configuração do Firebase Hosting
├── logo-mini.svg   # Logo/avatar do app
├── favicon.svg     # Favicon do app
└── README.md       # Documentação do projeto
```

---

## Dados e persistência

O app pode funcionar em dois modos:

- **Modo local:** quando `firebase-env.js` não existe ou `enabled` está `false`, os dados ficam no navegador via `localStorage`.
- **Modo Firebase:** quando `firebase-env.js` está configurado, o login usa Firebase Authentication e os dados ficam no Firestore.

No Firestore, o app salva um documento por usuário em:

```txt
users/{uid}/app/finance
```

Esse documento contém:

- `views`: lista de views;
- `activeViewId`: view ativa;
- `updatedAt`: data da última sincronização.

Quando o Firebase está ativo e um usuário ainda não tem documento no Firestore, o app cria uma view vazia, sem itens. Dados pessoais devem ser importados diretamente no Firestore do usuário e não ficam versionados no código público.

### Cadastro com chave-mestra

O cadastro público usa uma chave-mestra validada pelas regras do Firestore. A chave real não deve ficar no GitHub nem no JavaScript público.

Para configurar sua própria chave:

1. Escolha uma chave longa e difícil de adivinhar.
2. Gere o SHA-256 da chave.
3. No Firestore, crie o documento `appConfig/registration`.
4. Adicione o campo `masterKeyHash` com o hash gerado.
5. Publique as regras em `firestore.rules`.

Em apps estáticos, essa proteção evita que o app crie documentos de dados sem a chave correta. Para impedir criação de usuários no Firebase Auth em nível absoluto, use uma camada de backend, como Cloud Functions ou um fluxo de convite administrado.

---

## Próximos passos possíveis

Ideias para evolução do projeto:

- Exportação em CSV.
- Filtros avançados por categoria, pagamento ou recorrência.
- Tema claro/escuro.
- Comparativo entre views.
- Dashboard anual mais completo.

---

## Motivação

O controle financeiro pessoal muitas vezes começa em uma planilha simples, mas com o tempo ela pode ficar difícil de visualizar, editar e manter.

Este projeto busca manter a simplicidade da planilha, mas com uma interface mais agradável e pensada para leitura rápida:

- visão ampla do todo;
- poucos cliques para editar;
- separação clara entre tipos de gasto;
- indicadores úteis sempre visíveis;
- visual mais leve e com personalidade.

---

## Tecnologias utilizadas

- HTML
- CSS
- JavaScript puro
- SVG inline
- Canvas API para gráficos
- `localStorage`
- Firebase Authentication
- Cloud Firestore

Sem frameworks e sem dependências externas.

---

## Criador

Projeto criado por **EiHarold**.

Site: [eiharold.com](https://eiharold.com)

---

## Licença

Este projeto pode ser usado e adaptado livremente para fins pessoais.

Caso publique ou compartilhe uma versão derivada, mantenha os créditos ao criador original.


## Ajuste de ícones

- Ícone de **Mensal Completo** substituído por uma versão mais clara.
- Ícone de **Investimentos** substituído por uma versão mais elegante e coerente com o app.


## Ajustes da tela de login

- Texto de apoio alterado para: `Um app minimalista de gerenciamento financeiro`.
- Nota de acesso alterada para `Entre em contato para obter acesso`, com link para `eiharold.com`.
- Adicionada assinatura externa: `Feito com ❤️ por eiHarold.com`.


---

## Versão 1.0

A versão **1.0** finaliza a primeira fase do projeto com:

- interface principal completa;
- múltiplas views;
- login visual;
- dashboards e gráficos;
- modal de gestão de views;
- itens essenciais;
- loading intermediário entre login e carregamento dos dados.

O loading foi pensado para representar de forma mais realista o futuro carregamento assíncrono dos dados quando a aplicação for integrada ao banco de dados.


---

## Versão 1.2

A versão **1.2** conecta o app ao Firebase sem expor o arquivo local de configuração no GitHub.

### O que você precisa criar no Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Em **Authentication > Sign-in method**, ative **Email/Password**.
3. Em **Authentication > Users**, crie pelo menos um usuário com e-mail e senha.
4. Em **Firestore Database**, crie o banco em modo produção.
5. Em **Project settings > General > Your apps**, crie um app Web e copie o objeto `firebaseConfig`.

### Arquivo local de configuração

Copie o exemplo:

```bash
cp firebase-env.example.js firebase-env.js
```

Depois preencha `firebase-env.js` com os dados do seu app Web:

```js
window.EI_HAROLD_FIREBASE_ENV = {
  enabled: true,
  collection: "users",
  documentPath: ["app", "finance"],
  config: {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
  }
};
```

O arquivo `firebase-env.js` está no `.gitignore`, então ele não deve ser enviado para o GitHub. O arquivo `firebase-env.example.js` fica público apenas como modelo.

### Regras do Firestore

Publique as regras do arquivo `firestore.rules` no Firebase:

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/app/finance {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Essas regras permitem que cada usuário leia e edite somente o próprio documento.

### Hospedagem

O projeto já tem `firebase.json` para Firebase Hosting. Após instalar e autenticar o Firebase CLI:

```bash
firebase login
firebase init hosting
firebase deploy
```

Durante o `init`, use a pasta pública `.` e não configure como single-page app.

---

## Versão 1.1

A versão **1.1** prepara o app para conexão real com Firebase.

### O que mudou

- O loading não simula mais lentidão com tempo fixo.
- O loading fica ativo enquanto os dados são carregados.
- Quando o carregamento termina, o app é liberado automaticamente.
- Foi adicionado o arquivo `firebase-config.js`.
- A estrutura de conectores para Firebase Auth e Firestore ficou preparada para a versão 1.2.

### Arquivo `firebase-config.js`

Desde a versão 1.2, o arquivo `firebase-config.js` centraliza a integração real com Firebase:

- `FIREBASE_ENABLED`
- `init()`
- `login(email, password)`
- `getCurrentUser()`
- `loadData(userId)`
- `saveData(userId, data)`
- `logout()`

Por padrão, o app continua funcionando localmente se `firebase-env.js` não existir. Para ativar o Firebase, siga a seção **Versão 1.2**.

### Comportamento do loading

O loading aparece depois do login ou quando já existe sessão ativa. Ele encerra quando `loadAppData()` termina, ou seja, quando os dados locais/remotos já foram carregados, normalizados e renderizados.


## Ajuste final v1.1

- Altura dos boxes de gráficos levemente reduzida para caber melhor na tela.
- Pasta do projeto renomeada para `Custo de Vida V1.1`.


## Ajuste visual final

- Item selecionado no modal de views alterado de azul para cinza claro.
- Badge `Atual` do preview alterado para fundo branco.


## Ajuste de criação de views

- Nova view agora nasce vazia.
- Apenas a ação de duplicar copia os dados da view de origem.


## Ajuste do campo essencial

- Campo de item essencial no modal recebeu título `Esse gasto é obrigatório` com a bolinha azul.
- Checkbox agora aparece abaixo como `Gasto essencial`.


## Ajuste estrutural de colunas

- A coluna de **Gastos da Empresa** foi movida para a 4ª coluna visual.
- A 3ª coluna visual agora contém duas tabelas empilhadas: **Gastos anuais** e **Investimentos**.


## Ajuste de importância

- Checkbox `Gasto essencial` foi substituído pelo seletor `Importante?`.
- Opções: Não, Essencial, Obrigatório, Essencial e Obrigatório.
- Itens essenciais exibem bolinha azul; obrigatórios exibem bolinha vermelha; itens com ambos exibem as duas.
- Estatísticas gerais atualizadas para: Mensal essencial, Mensal obrigatório, Mensal ideal, Mensal total, Crédito, Débito, Parcela anual e Anual total.


## Ajuste de nomenclatura e cor

- Campo `Importante?` renomeado para `Importância`.
- Opção `Não` renomeada para `Baixa`.
- Bolinha de obrigatório alterada de vermelho para amarelo.


## Ajuste de largura

- Container principal da aplicação limitado a `1280px` de largura máxima.


## Rodapé da aplicação

- Adicionado rodapé discreto com o texto `Feito com ♥ por eiHarold.com`, igual ao rodapé da tela de login.


## Ajuste de largura 1320px

- Largura máxima do conteúdo principal alterada para `1320px`.
- Barra do topo e rodapé agora ocupam a largura completa da tela.
- Conteúdo interno do topo e do rodapé continua limitado a `1320px`.


## Filtros pelas estatísticas

- Os cards de estatísticas gerais agora são clicáveis.
- Ao clicar, as tabelas são filtradas para mostrar apenas os itens que compõem aquele cálculo.
- Ao clicar novamente no mesmo card, o filtro é removido.
- Busca e filtro por estatística podem funcionar juntos.


## Rodapé com logout

- Rodapé atualizado para: `Feito com <3 por eiHarold.com © ano atual - Direitos reservados - Sair`.
- O ano é preenchido automaticamente via JavaScript.
- O botão `Sair` executa logout pelo conector Firebase quando ativo, ou limpa a sessão local quando em modo local.


## Ajuste de largura 1360px

- Largura máxima do conteúdo alterada para `1360px`.
- Conteúdo interno do topo, principal e rodapé agora segue esse novo limite.


## Ajuste final de pacote

- Largura máxima alterada para `1400px`.
- Rodapé atualizado para: `Feito com <3 por eiHarold.com • Direitos reservados © ano atual • Sair`.
- Pasta interna do projeto renomeada para `custo_de_vida_v1`.
