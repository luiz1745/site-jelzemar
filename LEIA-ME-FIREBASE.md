# 🔐 Como ativar o login e o chat (Firebase) — passo a passo bem simples

O site já está pronto. Falta só você criar a "conta de banco de dados" gratuita do Google (Firebase) e colar 2 coisas no site. Leva uns 10 minutos. ⏱️

## 1️⃣ Criar o projeto
1. Entre em https://console.firebase.google.com com seu Gmail.
2. Clique em **Adicionar projeto** → dê o nome `ekulitech` → pode desligar o Google Analytics → **Criar**.

## 2️⃣ Ligar o login
1. Menu da esquerda: **Build → Authentication** → **Vamos começar**.
2. Aba **Sign-in method**: ative **E-mail/senha** ✅ e **Google** ✅ (escolha seu e-mail de suporte).
3. Aba **Settings → Authorized domains**: adicione o endereço onde seu site vai ficar (ex.: `ekulitech.com`).

## 3️⃣ Criar o banco de dados
1. **Build → Firestore Database** → **Criar banco de dados**.
2. Escolha **modo de produção** e um local (ex.: `europe-west`) → **Ativar**.
3. Aba **Regras**: apague tudo, cole o conteúdo do arquivo **`firestore.rules`**, troque `COLE_SEU_EMAIL@gmail.com` pelo **seu e-mail** e clique **Publicar**.

## 4️⃣ Pegar as chaves e colar no site
1. Engrenagem ⚙️ → **Configurações do projeto** → role até **Seus apps** → ícone **`</>` (Web)** → dê um nome → **Registrar app**.
2. Vai aparecer um bloco `firebaseConfig = { apiKey: ..., authDomain: ..., projectId: ..., appId: ... }`.
3. Abra o arquivo **`firebase-config.js`** e cole esses 4 valores no lugar dos `COLE_AQUI`.
4. Na última linha do mesmo arquivo, troque `COLE_SEU_EMAIL@gmail.com` pelo **seu e-mail** (o mesmo das regras).

## 5️⃣ Seu acesso de dono 👑
- Entre no site com **esse e-mail** pelo botão **"Continuar com Google"** (assim o e-mail já vem verificado).
- Se criar conta com e-mail e senha, **clique no link de verificação** que chega na sua caixa de entrada. Sem verificar, o painel não abre. (Isso impede que outra pessoa se passe por você!)
- Depois do login aparece no menu da sua foto: **Painel do dono** 🛠️ (`admin.html`).

## 💬 Como funciona na prática
- **Cliente:** cria conta → escolhe iPhone → finaliza → cai no chat do pedido, manda o comprovante.
- **Você:** abre `admin.html` → vê todos os pedidos (bolinha vermelha = mensagem nova) → conversa, **Confirma pagamento** e **Marca como enviado**.
- Você ainda recebe um **e-mail de aviso** a cada mensagem/comprovante.

## ⚠️ Importante
- O plano gratuito (Spark) do Firebase é suficiente para começar.
- Os comprovantes são fotos reduzidas guardadas no próprio chat (não precisa de Storage pago).
- Nunca compartilhe a conta do Google que administra o Firebase.
- O site precisa estar **publicado num endereço** (https). Abrir os arquivos direto no computador não faz o login funcionar.
