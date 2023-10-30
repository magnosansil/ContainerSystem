const { PortYard } = require ("./PortYard");

class PortSystem {
    constructor() {
      this.yard = new PortYard();
    }

    // Consultar peso total de cargas empilhadas por tipo
    getTotalWeightByCargoType(cargoType) {
      let totalWeight = 0;
      for (const stack of this.yard.stacks) {
        for (const container of stack.containers) {
          if (container.cargoType === cargoType) {
            totalWeight += container.weight;
          }
        }
      }
      return totalWeight;
    }
  
    getContainerById(containerId) {
      for (const stack of this.yard.stacks) {
        const container = stack.containers.find((c) => c.id === containerId);
        if (container) {
          return container;
        }
      }
      return null;
    }
  
    // Consultar dados do contêiner no topo de uma posição de empilhamento
    getTopContainerAtPosition(position) {
      const stack = this.yard.stacks.find((s) => s.position === position);
      if (!stack || stack.isEmpty()) {
        return null;
      }
      const topContainer = stack.getTopContainer();
      return {
        id: topContainer.id,
        owner: topContainer.owner,
        cargoType: topContainer.cargoType,
        weight: topContainer.weight,
        operationType: topContainer.operationType,
      };
    }
  
    // Consultar quantidade de contêineres por tipo de carga
    getContainersByCargoType(cargoType) {
      let count = 0;
      for (const stack of this.yard.stacks) {
        for (const container of stack.containers) {
          if (container.cargoType === cargoType) {
            count++;
          }
        }
      }
      return count;
    }
  
    // Consultar quantidade de contêineres por tipo de operação
    getContainersByOperationType(operationType) {
      let count = 0;
      for (const stack of this.yard.stacks) {
        for (const container of stack.containers) {
          if (container.operationType === operationType) {
            count++;
          }
        }
      }
      return count;
    }
  
    // Consultar posições de empilhamento vazias
    getEmptyPositions() {
      const emptyPositions = [];
      for (const stack of this.yard.stacks) {
        if (stack.isEmpty()) {
          emptyPositions.push(stack.position);
        }
      }
      return emptyPositions;
    }
  }
  
module.exports =  { PortSystem };