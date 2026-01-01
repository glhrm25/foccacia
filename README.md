# FOCCACIA (PROJETO LOCAL)

# Descrição Geral:

- Este repositório contém o desenvolvimento de um projeto dividido em três fases, cujo objetivo é implementar uma aplicação que permite o acesso, através de uma interface web (hypermedia), a informação providenciada por uma API de futebol.

- O desenvolvimento da aplicação FOCCACIA tem 3 ciclos de desenvolvimento, distribuídos por três partes (Parte 1, Parte 2 e Parte 3).

# Estrutura do Projeto
    foccacia-ipw33d-g05/
    ├── foccacia/
    │   ├── commons/              # Módulo que contêm código comum a todos os módulos.
    │   ├── data/                 # Acesso aos dados da aplicação (grupos e utilizadores) e aos dados da API de futebol.
    │   ├── docs/                 # Documentação do projeto.
    │   ├── services/             # Implementação da lógica de cada funcionalidade da aplicação.
    │   ├── test/                 # Testes do módulo services realizados com Mocha.
    │   ├── web/                  # Implementação das rotas HTTP que compõem a API REST da aplicação web e ficheiros handlebars.
    │   ├── foccacia-server.js    # Ficheiro que constitui o ponto de entrada à aplicação do servidor.
    │
    └── README.md                 # Documento geral do grupo

# Fases do Projeto:
# Fase 1 — Base da aplicação

- Desenvolvimento de uma aplicação que disponibilize uma WEB API que siga os princípios atuais da Web e os princípios REST, com respostas em formato JSON e que suporte as seguintes funcionalidades:

    - Obter todas as competições disponíveis — Para cada competição, deve retornar o seu código e nome.
    - Obter todas as equipas de uma época de competição específica — Cada equipa deve conter o seu nome, país e o nome e posição de todos os seus jogadores.
    - Armazenar grupos de jogadores — Cada grupos representa uma seleção dos jogadores preferidos do utilizador, para uma certa época de competição.
      - Criar um grupo através de um nome, descrição, competição e época.
      - Editar um grupo, alterando o seu nome e descrição.
      - Apresentar todos os grupos.
      - Remover um grupo.
      - Obter os detalhes de um grupo, incluindo:
          - Nome do grupo
          - Descrição do grupo
          - Competição e Época
          - Lista de jogadores, contendo:
              - Id do jogador
              - Nome do jogador
              - Id da equipa
              - Nome da equipa
              - Posição
              - Nacionalidade
              - Idade
      - Adicionar um jogador a um grupo, sendo armazenado:
          - Id do jogador
          - Nome do jogador
          - Id da equipa
          - Nome da equipa
      - Remove um jogador de um grupo
    - Criar um utilizador dado um username. Para todas as operações, um token de utilizador deve ser enviado no cabeçalho de autorização, usando um "Bearer Token". Este token é gerado quando o utilizador é criado e consiste numa string UUID, obtida através do método crypto.randomUUID().

# Fase 2 — Aplicação Web

- Adicionar uma interface web à aplicação FOCCACIA desenvolvida na parte 1, armazenar os dados numa base de dados em vez de na memória e incorporar novas tecnologias e técnicas.

- # Requisitos funcionais
    - Criar uma interface web, apresentada no navegador, para todas as funcionalidades da Web API.
    - Todas as operações que na Web API usam PUT ou DELETE, exceto a criação de utilizadores, devem ser implementadas com o método POST através de formulários HTML.
    - A interface é renderizada no servidor, utilizando HTML, CSS e Handlebars. Pode usar Bootstrap para o estilo base.
    - O utilizador não deve, em nenhuma situação, ter de conhecer ou inserir IDs de grupos, equipas ou ligas. Apenas é permitido digitar o nome de uma equipa para pesquisas ou o nome de um grupo ao criar ou editar esse grupo.

- # Requisitos não funcionais
    - A interface HTML/CSS deve ser implementada num novo ficheiro focaccia-web-site.mjs, ao mesmo nível de focaccia-web-api.mjs.
    - Criar um módulo que substitua focaccia-data-mem.mjs, armazenando os dados numa base ElasticSearch, sem exigir alterações nos restantes módulos, exceto na importação do módulo em focaccia-server.mjs (ou num módulo de configuração da aplicação).
    - A interação com o ElasticSearch deve ser feita através da HTTP API usando fetch, sem recorrer a módulos específicos do Node.
    - O módulo focaccia-data-mem.mjs não deve ser eliminado, permitindo alternar a implementação apenas através das importações no módulo de configuração.

- Qualidade e testes
    - Esta fase deve também ser aproveitada para melhorar a qualidade do código e aumentar a quantidade e qualidade de testes, tanto unitários como de integração.

# Fase 3 —  Autenticação

- # Objetivos
    - Adicionar autenticação à aplicação web FOCCACIA.
    - Suportar operações PUT e DELETE na interface web usando JavaScript no cliente.

- # Requisitos funcionais
    - Registo e autenticação de utilizadores com Passport.
    - Funcionalidades de gestão de grupos acessíveis apenas a utilizadores autenticados.
    - Grupos privados: só o proprietário pode manipular.
    - Todas as funcionalidades da Web API da parte 1 disponíveis via site.
    - DELETE e PUT da Web API podem ser usados no site com fetch() no browser.
    - O utilizador não deve conhecer ou inserir IDs de grupos, equipas ou ligas.

- # Requisitos não funcionais
    - Entregar relatório no wiki do repositório do grupo, descrevendo a implementação final (não incluir estados intermédios).
    - Relatório deve incluir:
        - Estrutura da aplicação (servidor e cliente).
        - Design do armazenamento em ElasticSearch: índices, propriedades, relações.
        - Mapeamento entre documentos ElasticSearch e modelo de objetos da aplicação web.
        - Documentação da API do servidor.
        - Instruções completas para executar a aplicação e testes:
            - Incluir introdução automática de dados de teste.
            - Deve permitir execução em qualquer máquina (incluindo do docente).
            - Tempo máximo de execução: 5 minutos.
