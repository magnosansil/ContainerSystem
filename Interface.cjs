const { PortSystem } = require('./PortSystem');
const { Container } = require('./Container');
const { PortCrane } = require('./PortCrane');

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const portSystem = new PortSystem();
const portCrane = new PortCrane(portSystem);

function displayMenu() {
  console.log();
  console.log('Selecione uma ação:');
  console.log('1. Inserir contêiner');
  console.log('2. Mover contêiner');
  console.log('3. Consultar dados de contêiner por ID');
  console.log('4. Consultar contêiner no topo de uma posição (A até J)');
  console.log('5. Consultar quantidade de contêineres por tipo de carga');
  console.log('6. Consultar quantidade de contêineres por tipo de operação');
  console.log('7. Consultar peso total por tipo de carga');
  console.log('8. Consultar posições vazias');
  console.log('9. Excluir contêiner');
  console.log('10. Sair');
}

function insertContainer() {
  rl.question('ID do contêiner: ', (id) => {
    // Verifique se um contêiner com o mesmo ID já existe
    const duplicateContainer = portSystem.yard.stacks
      .flatMap((stack) => stack.containers)
      .find((container) => container.id === id);

    if (duplicateContainer) {
      console.log('Um contêiner com o mesmo ID já existe. O contêiner não foi inserido.');
      displayMenu();
      processInput();
      return; // Saia da função para evitar a inserção do contêiner duplicado
    }

    rl.question('Nome do proprietário: ', (owner) => {
      // Adicione aqui a seleção de tipos de carga e tipos de operação
      console.log();
      console.log('Selecione o tipo de carga:');
      console.log('1. Carga seca');
      console.log('2. Commodities');
      console.log('3. Produtos perigosos');
      console.log('4. Produtos perecíveis');
      rl.question('Escolha uma opção (1/2/3/4): ', (cargoTypeChoice) => {
        const cargoTypes = ['Carga seca', 'Commodities', 'Produtos perigosos', 'Produtos perecíveis'];
        const cargoType = cargoTypes[parseInt(cargoTypeChoice) - 1];

        console.log();
        console.log('Selecione o tipo de operação:');
        console.log('1. Embarque');
        console.log('2. Desembarque');
        rl.question('Escolha uma opção (1/2): ', (operationTypeChoice) => {
          const operationTypes = ['Embarque', 'Desembarque'];
          const operationType = operationTypes[parseInt(operationTypeChoice) - 1];

          rl.question('Peso da carga (em kg): ', (weight) => {
            if (isNaN(weight)) {
              console.log('Peso da carga inválido.');
              displayMenu();
              processInput();
              return;
            }
            rl.question('Posição de empilhamento: ', (position) => {
              // Converter a posição inserida para maiúsculas
              const normalizedPosition = position.toUpperCase();
              const stack = portSystem.yard.stacks.find((s) => s.position === normalizedPosition);
              if (stack) {
                if (stack.isFull()) {
                  console.log();
                  console.log('A posição de empilhamento está cheia. O contêiner não foi inserido.');
                } else {
                  const container = new Container(id, owner, cargoType, parseFloat(weight), operationType);
                  stack.pushContainer(container);
                  console.log();
                  console.log(`Contêiner ${id} inserido na posição ${normalizedPosition}`);
                }
              } else {
                console.log();
                console.log('Posição de empilhamento inválida. O contêiner não foi inserido.');
              }
              displayMenu();
              processInput();
            });
          });
        });
      });
    });
  });
}

function moveContainer() {
  rl.question('ID do contêiner a ser movido: ', (containerId) => {
    rl.question('Nova posição de empilhamento: ', (newPosition) => {
      newPosition = newPosition.toUpperCase();
      portCrane.moveContainer(containerId, newPosition);
      displayMenu();
      processInput();
    });
  });
}

function queryContainerData() {
  rl.question('ID do contêiner a ser consultado: ', (containerId) => {
    const container = portSystem.getContainerById(containerId);
    if (container) {
      console.log('Dados do contêiner:');
      console.log(`ID: ${container.id}`);
      console.log(`Proprietário: ${container.owner}`);
      console.log(`Tipo de carga: ${container.cargoType}`);
      console.log(`Peso da carga: ${container.weight} kg`);
      console.log(`Tipo de operação: ${container.operationType}`);
    } else {
      console.log('Contêiner não encontrado.');
    }
    displayMenu();
    processInput();
  });
}

function queryTopContainerAtPosition() {
  rl.question('Posição de empilhamento: ', (position) => {
    position = position.toUpperCase();
    const container = portSystem.getTopContainerAtPosition(position);
    if (container) {
      console.log('Contêiner no topo da posição:');
      console.log(`ID: ${container.id}`);
      console.log(`Proprietário: ${container.owner}`);
      console.log(`Tipo de carga: ${container.cargoType}`);
      console.log(`Peso da carga: ${container.weight} kg`);
      console.log(`Tipo de operação: ${container.operationType}`);
    } else {
      console.log('Posição vazia ou inválida.');
    }
    displayMenu();
    processInput();
  });
}

function queryContainersByCargoType() {
  // Menu para selecionar o tipo de carga
  console.log('Selecione o tipo de carga:');
  console.log('1. Carga Seca');
  console.log('2. Commodities');
  console.log('3. Produtos Perigosos');
  console.log('4. Produtos Perecíveis');
  rl.question('Escolha uma opção (1/2/3/4): ', (cargoTypeChoice) => {
    const cargoTypes = ['Carga Seca', 'Commodities', 'Produtos Perigosos', 'Produtos Perecíveis'];
    const cargoType = cargoTypes[parseInt(cargoTypeChoice) - 1];

    if (!cargoType) {
      console.log('Tipo de carga inválido.');
      displayMenu();
      processInput();
      return;
    }

    // Ajustar o cargoType para corresponder ao formato correto
    const formattedCargoType = formatCargoType(cargoType);

    const count = portSystem.getContainersByCargoType(formattedCargoType);
    console.log(`Quantidade de contêineres do tipo ${formattedCargoType}: ${count}`);
    displayMenu();
    processInput();
  });
}

function formatCargoType(cargoType) {
  return cargoType.charAt(0).toUpperCase() + cargoType.slice(1).toLowerCase();
}

function queryContainersByOperationType() {
  // Menu para selecionar o tipo de operação
  console.log('Selecione o tipo de operação:');
  console.log('1. Embarque');
  console.log('2. Desembarque');
  rl.question('Escolha uma opção (1/2): ', (operationTypeChoice) => {
    const operationTypes = ['Embarque', 'Desembarque'];
    const operationType = operationTypes[parseInt(operationTypeChoice) - 1];

    if (!operationType) {
      console.log('Tipo de operação inválido.');
      displayMenu();
      processInput();
      return;
    }

    const count = portSystem.getContainersByOperationType(operationType);
    console.log(`Quantidade de contêineres com operação ${operationType}: ${count}`);
    displayMenu();
    processInput();
  });
}

function queryTotalWeightByCargoType() {
  // Menu para selecionar o tipo de carga
  console.log('Selecione o tipo de carga:');
  console.log('1. Carga Seca');
  console.log('2. Commodities');
  console.log('3. Produtos Perigosos');
  console.log('4. Produtos Perecíveis');
  rl.question('Escolha uma opção (1/2/3/4): ', (cargoTypeChoice) => {
    const cargoTypes = ['Carga Seca', 'Commodities', 'Produtos Perigosos', 'Produtos Perecíveis'];
    const cargoType = cargoTypes[parseInt(cargoTypeChoice) - 1];

    // Ajustar o cargoType para corresponder ao formato correto
    const formattedCargoType = formatCargoType(cargoType);

    if (!cargoType) {
      console.log('Tipo de carga inválido.');
      displayMenu();
      processInput();
      return;
    }

    const totalWeight = portSystem.getTotalWeightByCargoType(formattedCargoType);
    console.log(`Peso total dos contêineres do tipo ${formattedCargoType}: ${totalWeight} kg`);
    displayMenu();
    processInput();
  });
}

function queryEmptyPositions() {
  const emptyPositions = portSystem.getEmptyPositions();
  if (emptyPositions.length === 0) {
    console.log('Todas as posições estão ocupadas.');
  } else {
    console.log('Posições de empilhamento vazias: ' + emptyPositions.join(', '));
  }
  displayMenu();
  processInput();
}

function deleteContainer() {
  rl.question('ID do contêiner a ser excluído: ', (containerId) => {
    const stack = portSystem.yard.stacks.find((s) =>
      s.containers.some((container) => container.id === containerId)
    );
    if (stack) {
      if (stack.popContainer(containerId)) {
        displayMenu();
        processInput();
      } else {
        console.log('Contêiner não encontrado.');
        displayMenu();
        processInput();
      }
    } else {
      console.log('Contêiner não encontrado.');
      displayMenu();
      processInput();
    }
  });
}

function processInput() {
  rl.question('Escolha uma ação (1/2/3/4/5/6/7/8/9/10): ', (choice) => {
    switch (choice) {
      case '1':
        console.log();
        insertContainer();
        break;
      case '2':
        console.log();
        moveContainer();
        break;
      case '3':
        console.log();
        queryContainerData();
        break;
      case '4':
        console.log();
        queryTopContainerAtPosition();
        break;
      case '5':
        console.log();
        queryContainersByCargoType();
        break;
      case '6':
        console.log();
        queryContainersByOperationType();
        break;
      case '7':
        console.log();
        queryTotalWeightByCargoType();
        break;
      case '8':
        console.log();
        queryEmptyPositions();
        break;
      case '9':
        console.log();
        deleteContainer();
        break;
      case '10':
        rl.close();
        break;
      default:
        console.log();
        console.log('Escolha inválida. Tente novamente.');
        displayMenu();
        processInput();
    }
  });
}

displayMenu();
processInput();