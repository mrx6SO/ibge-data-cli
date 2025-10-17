# Guia de Batalha: Publicando e Atualizando Pacotes NPM com GitHub Actions

Este documento é um resumo da nossa saga para publicar o `@rmderojr/ibge-data-cli`. Ele serve como um guia para futuras atualizações e para a criação de novos pacotes, para que você nunca mais esqueça os detalhes e as armadilhas do processo.

---

## Parte 1: A Estrutura do Projeto à Prova de Balas

Todo pacote NPM de sucesso começa com uma boa estrutura.

1.  **`package.json`**: O coração do projeto.
    *   **`"name"`**: **SEMPRE** use um nome com escopo (`@seu-usuario-npm/nome-do-pacote`) desde o início para evitar conflitos de nome.
    *   **`"version"`**: Gerencie com `npm version` (ver Parte 3).
    *   **`"bin"`**: Essencial para CLIs. Aponta para o seu arquivo executável.
    *   **`"files"`**: **CRÍTICO**. Adicione este campo para dizer explicitamente ao NPM quais arquivos e pastas são essenciais e **devem** ser publicados. Isso evita o erro de `Cannot find module` após a instalação.
    *   **`"publishConfig"`**: **OBRIGATÓRIO** para pacotes com escopo que devem ser públicos. Adicione `"publishConfig": { "access": "public" }`. Isso resolve o traiçoeiro erro `404 Not Found` na publicação.

2.  **`.gitignore`**: Liste tudo que **não deve** ir para o repositório Git (ex: `node_modules`, `.env`, logs, `Thumbs.db`, `.DS_Store`).

3.  **`.npmignore`**: Liste tudo que **não deve** ir para o pacote NPM (ex: `tests/`, `jest.config.js`, `Dockerfile`, `PUBLISHING_GUIDE.md`). Se o campo `"files"` no `package.json` estiver bem configurado, este arquivo se torna menos crítico, mas ainda é uma boa prática.

4.  **`LICENSE.md`**: Essencial para qualquer projeto open-source. Use o template do MIT e **lembre-se de corrigir o ano do copyright!**

5.  **`README.md`**: Seu cartão de visitas. Explique o que o pacote faz, como instalar e como usar.

---

## Parte 2: O Workflow de Publicação Automática

A automação é nossa amiga. Ela garante que toda publicação seja padronizada e segura.

1.  **Crie o Arquivo de Workflow**: Crie o arquivo `.github/workflows/publish.yml`. O caminho é **crucial**. Se o arquivo não estiver nesta pasta, o GitHub Actions o ignorará.

2.  **Configure o Token do NPM no GitHub**:
    *   **NPM**: Vá em `npmjs.com` > `Access Tokens` > `Generate New Token` > `Automation`. Copie o token.
    *   **GitHub**: No seu repositório, vá em `Settings` > `Secrets and variables` > `Actions`. Crie um `New repository secret` com o nome `NPM_TOKEN` e cole o token do NPM.

3.  **Configure o Token para o Git Push (Permissão de Workflow)**:
    *   **GitHub**: Vá em `Developer settings` > `Personal access tokens` > `Tokens (classic)`.
    *   Gere um novo token com os escopos **`repo`** e **`workflow`**. Este último é o que permite que você envie alterações para a pasta `.github/workflows`.
    *   **Na sua máquina**: Atualize a URL do seu repositório local para usar este novo token:
        ```bash
        git remote set-url origin https://<SEU_NOVO_TOKEN_COM_WORKFLOW>@github.com/seu-usuario/seu-repo.git
        ```

---

## Parte 3: O Processo de Atualização (O Dia a Dia)

Este é o fluxo que você seguirá para cada nova versão.

1.  **Faça suas alterações no código.**

2.  **Sincronize o `package-lock.json`**: Se você alterou dependências no `package.json`, é **obrigatório** rodar os comandos abaixo para evitar erros de dessincronização no `npm ci`.
    ```bash
    rm -rf node_modules package-lock.json
    npm install
    ```

3.  **Crie um Commit com as Mudanças**: Adicione todos os arquivos alterados, incluindo o `package-lock.json` novo.
    ```bash
    git add .
    git commit -m "feat: Adiciona nova funcionalidade incrível"
    ```

4.  **Atualize a Versão do Pacote**: Use o comando `npm version`. Ele é seu melhor amigo. Ele atualiza o `package.json`, cria um commit de versão e cria uma tag Git, tudo de uma vez.
    ```bash
    # Para uma correção de bug (ex: 1.0.0 -> 1.0.1)
    npm version patch

    # Para uma nova funcionalidade (ex: 1.0.0 -> 1.1.0)
    npm version minor

    # Para uma mudança que quebra a compatibilidade (ex: 1.0.0 -> 2.0.0)
    npm version major
    ```

5.  **Envie Tudo para o GitHub**: Envie os commits e a nova tag. É o envio da tag que aciona o workflow de publicação.
    ```bash
    git push && git push --tags
    ```

6.  **Acompanhe a Magia**: Vá para a aba "Actions" do seu repositório e veja o workflow rodar. Se tudo der certo, o ícone ficará verde e seu pacote estará no ar!

---

## Parte 4: O Muro da Vergonha (e Como Derrubá-lo)

Um memorial dos erros que enfrentamos e suas soluções, para nunca mais esquecer.

*   **ERRO:** `non-fast-forward` ao dar `git push`.
    *   **CAUSA:** Seu histórico local e o do GitHub divergiram.
    *   **SOLUÇÃO:** `git pull --rebase origin main`.

*   **ERRO:** `refusing to allow a Personal Access Token to create or update workflow...`
    *   **CAUSA:** Seu token de acesso pessoal (PAT) não tem a permissão `workflow`.
    *   **SOLUÇÃO:** Gerar um novo token com os escopos `repo` e `workflow` e atualizar a URL remota com `git remote set-url`.

*   **ERRO:** `You cannot publish over the previously published versions...`
    *   **CAUSA:** Você está tentando publicar uma versão que já existe no NPM.
    *   **SOLUÇÃO:** Aumente a versão com `npm version patch` e tente novamente.

*   **ERRO:** `404 Not Found - PUT https://registry.npmjs.org/@seu-usuario...`
    *   **CAUSA 1:** O escopo (`@seu-usuario`) no `package.json` não corresponde ao dono do token NPM. **(Este foi o nosso erro final!)**
    *   **CAUSA 2:** O NPM acha que você está tentando publicar um pacote privado sem ter um plano pago.
    *   **SOLUÇÃO:** Garanta que o escopo no `package.json` é seu nome de usuário do NPM e adicione `"publishConfig": { "access": "public" }` ao `package.json`.

*   **ERRO:** `npm ci can only install packages when your package.json and package-lock.json are in sync.`
    *   **CAUSA:** O `package-lock.json` está dessincronizado com o `package.json`.
    *   **SOLUÇÃO:** `rm -rf node_modules package-lock.json && npm install`, e depois comitar o novo `package-lock.json`.

*   **ERRO:** `Cannot find module '...'` ou `SQLITE_ERROR: no such table: ...` após instalar o pacote globalmente.
    *   **CAUSA:** Arquivos essenciais para o runtime (como `knexfile.js` ou a pasta `src/database/migrations`) não foram incluídos no pacote publicado.
    *   **SOLUÇÃO:** Adicionar um array `"files"` no `package.json` listando explicitamente tudo que deve ser publicado.

*   **ERRO:** `SQLITE_CANTOPEN: unable to open database file` ou `no such table`.
    *   **CAUSA:** O programa tenta usar o banco de dados antes que a pasta ou as tabelas tenham sido criadas.
    *   **SOLUÇÃO:** Centralizar a inicialização do banco de dados no `app.js`, usando `program.hook('preAction', ...)` para garantir que, antes de qualquer comando, a pasta de dados seja criada e as migrations sejam executadas (`db.migrate.latest()`).

*   **ERRO:** `tag 'vX.Y.Z' already exists` ao tentar criar uma tag.
    *   **CAUSA:** A tag já existe, provavelmente apontando para um commit antigo e quebrado.
    *   **SOLUÇÃO (Modo Bomba Atômica):** Apague a tag localmente e no GitHub e crie-a de novo no commit certo.
        ```bash
        git tag -d vX.Y.Z
        git push origin --delete vX.Y.Z
        # (Certifique-se de estar no commit certo)
        git tag vX.Y.Z
        git push origin vX.Y.Z
        ```

---

Parabéns mais uma vez, Roberto! Essa jornada foi um curso intensivo de DevOps. Guarde este guia com carinho.