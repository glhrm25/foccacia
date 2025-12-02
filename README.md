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
    │   ├── web/api/              # Implementação das rotas HTTP que compõem a API REST da aplicação web.
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

# Fase 3 —  Autenticação

- Adicionar autenticação à aplicação web com interface de utilizador (website) e suportar as operações PUT e DELETE, que não foram implementadas na fase anterior.
