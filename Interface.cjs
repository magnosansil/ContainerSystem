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
  rl.question('Nome do proprietário: ', (owner) => {
    console.log();
    console.log('Selecione o tipo de carga:');
    console.log('1. Carga seca');
    console.log('2. Commodities');
    console.log('3. Produtos perigosos');
    console.log('4. Produtos perecíveis');
    
    const validCargoTypes = ['Carga seca', 'Commodities', 'Produtos perigosos', 'Produtos perecíveis'];
    
    const getCargoType = () => {
      rl.question('Escolha uma opção (1/2/3/4): ', (cargoTypeChoice) => {
        const cargoTypeIndex = parseInt(cargoTypeChoice) - 1;
        if (cargoTypeIndex >= 0 && cargoTypeIndex < validCargoTypes.length) {
          const cargoType = validCargoTypes[cargoTypeIndex];
          selectOperationType(cargoType);
        } else {
          console.log('Opção de tipo de carga inválida. Tente novamente.');
          getCargoType();
        }
      });
    };
    
    const selectOperationType = (cargoType) => {
      console.log();
      console.log('Selecione o tipo de operação:');
      console.log('1. Embarque');
      console.log('2. Desembarque');
      
      rl.question('Escolha uma opção (1/2): ', (operationTypeChoice) => {
        const operationTypeIndex = parseInt(operationTypeChoice) - 1;
        if (operationTypeIndex === 0 || operationTypeIndex === 1) {
          const operationType = operationTypeIndex === 0 ? 'Embarque' : 'Desembarque';
          askForWeight(cargoType, operationType);
        } else {
          console.log('Opção de tipo de operação inválida. Tente novamente.');
          selectOperationType(cargoType);
        }
      });
    };
    
    const askForWeight = (cargoType, operationType) => {
      rl.question('Peso da carga (em kg): ', (weight) => {
        if (!isNaN(weight)) {
          rl.question('Posição de empilhamento (A até J): ', (position) => {
            const normalizedPosition = position.toUpperCase();
            const stack = portSystem.yard.stacks.find((s) => s.position === normalizedPosition);
            if (stack) {
              if (stack.isFull()) {
                console.log('A posição de empilhamento está cheia. O contêiner não foi inserido.');
              } else {
                const containerId = generateContainerId(normalizedPosition);
                const container = new Container(containerId, owner, cargoType, parseFloat(weight), operationType);
                stack.pushContainer(container);
                console.log(`Contêiner ${containerId} inserido na posição ${normalizedPosition}`);
              }
            } else {
              console.log('Posição de empilhamento inválida. O contêiner não foi inserido.');
            }
            displayMenu();
            processInput();
          });
        } else {
          console.log('Peso da carga inválido. Tente novamente.');
          askForWeight(cargoType, operationType);
        }
      });
    };
    
    getCargoType();
  });
}

function generateContainerId(position) {
  let isThereId
  const stack = portSystem.yard.stacks.find((s) => s.position === position);
  if (stack) {
    const orderNumber = stack.containers.length + 1;
    const containerId = `${position}.${orderNumber}`;
    isThereId = containerId;
  } else {
    isThereId = 'N/A'
  }
  return isThereId;
}

function moveContainer() {
  rl.question('ID do contêiner a ser movido: ', (containerId) => {
    const container = portSystem.getContainerById(containerId);
    if (!container) {
      console.log();
      console.log('Contêiner não encontrado. Movimentação não permitida.');
      displayMenu();
      processInput();
      return;
    }
    rl.question('Nova posição de empilhamento: ', (newPosition) => {
      newPosition = newPosition.toUpperCase();

      // Verifica se a posição de destino está cheia
      const stack = portSystem.yard.stacks.find((s) => s.position === newPosition);
      if (stack && stack.isFull()) {
        console.log();
        console.log('A posição de destino está cheia. Movimentação não permitida.');
        displayMenu();
        processInput();
        return;
      }

      // Verifica se o contêiner é o último na posição atual
      const currentStack = portSystem.yard.stacks.find((s) => 
        s.containers.length > 0 && s.containers[s.containers.length - 1].id === containerId
      );  
      if (currentStack && currentStack.containers.length > 0) {
        const lastContainerInCurrentStack = currentStack.containers[currentStack.containers.length - 1];
        if (lastContainerInCurrentStack.id !== container.id) {
          console.log();
          console.log('Somente o contêiner no topo da pilha pode ser movido.');
          displayMenu();
          processInput();
          return;
        }
      }

      // Mova o contêiner para a nova posição
      if (portCrane.moveContainer(containerId, newPosition)) {
        // Atualize o ID do contêiner
        container.id = `${newPosition}.${stack.containers.length}`;
        console.log();
        console.log(`Contêiner movido para a posição ${newPosition} com o novo ID: ${container.id}`);
      } else {
        console.log();
        console.log('Movimentação não permitida. O contêiner não foi movido.');
      }
      displayMenu();
      processInput();
    });
  });
}

function queryContainerData() {
  rl.question('ID do contêiner a ser consultado: ', (containerId) => {
    const container = portSystem.getContainerById(containerId);
    if (container) {
      console.log();
      console.log('Dados do contêiner:');
      console.log(`ID: ${container.id}`);
      console.log(`Proprietário: ${container.owner}`);
      console.log(`Tipo de carga: ${container.cargoType}`);
      console.log(`Peso da carga: ${container.weight} kg`);
      console.log(`Tipo de operação: ${container.operationType}`);
    } else {
      console.log();
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
      console.log();
      console.log('Contêiner no topo da posição:');
      console.log(`ID: ${container.id}`);
      console.log(`Proprietário: ${container.owner}`);
      console.log(`Tipo de carga: ${container.cargoType}`);
      console.log(`Peso da carga: ${container.weight} kg`);
      console.log(`Tipo de operação: ${container.operationType}`);
    } else {
      console.log();
      console.log('Posição vazia ou inválida.');
    }
    displayMenu();
    processInput();
  });
}

function formatCargoType(cargoType) {
  return cargoType.charAt(0).toUpperCase() + cargoType.slice(1).toLowerCase();
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
      console.log();
      console.log('Tipo de carga inválido.');
      displayMenu();
      processInput();
      return;
    }

    // Ajustar o cargoType para corresponder ao formato correto
    const formattedCargoType = formatCargoType(cargoType);

    const count = portSystem.getContainersByCargoType(formattedCargoType);
    console.log();
    console.log(`Quantidade de contêineres do tipo ${formattedCargoType}: ${count}`);
    displayMenu();
    processInput();
  });
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
      console.log();
      console.log('Tipo de operação inválido.');
      displayMenu();
      processInput();
      return;
    }

    const count = portSystem.getContainersByOperationType(operationType);
    console.log();
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

    if (!cargoType) {
      console.log();
      console.log('Tipo de carga inválido.');
      displayMenu();
      processInput();
      return;
    }

    // Ajustar o cargoType para corresponder ao formato correto
    const formattedCargoType = formatCargoType(cargoType);

    const totalWeight = portSystem.getTotalWeightByCargoType(formattedCargoType);
    console.log();
    console.log(`Peso total dos contêineres do tipo ${formattedCargoType}: ${totalWeight} kg`);
    displayMenu();
    processInput();
  });
}

function queryEmptyPositions() {
  const emptyPositions = portSystem.getEmptyPositions();
  if (emptyPositions.length === 0) {
    console.log();
    console.log('Todas as posições estão ocupadas.');
  } else {
    console.log();
    console.log('Posições de empilhamento vazias: ' + emptyPositions.join(', '));
  }
  displayMenu();
  processInput();
}

function deleteContainer() {
  rl.question('ID do contêiner a ser excluído: ', (containerId) => {
    // Verifica se o contêiner existe na posição e é o contêiner no topo da pilha
    const stack = portSystem.yard.stacks.find((s) =>
      s.containers.length > 0 && s.containers[s.containers.length - 1].id === containerId
    );

    if (stack) {
      stack.popContainer(containerId);
      console.log();
      console.log(`Contêiner ${containerId} foi removido.`);
    } else {
      console.log();
      console.log('Contêiner não encontrado ou não está no topo da pilha.');
    }

    displayMenu();
    processInput();
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