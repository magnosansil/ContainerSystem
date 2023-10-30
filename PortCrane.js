class PortCrane {
  constructor(portSystem) {
    this.portSystem = portSystem;
  }

  moveContainer(containerId, newPosition) {
    const container = this.portSystem.getContainerById(containerId);
    if (!container) {
      console.log("Contêiner não encontrado.");
      return false;
    }

    const currentStack = this.portSystem.yard.stacks.find(
      (stack) => stack.containers.includes(container)
    );

    if (!currentStack) {
      console.log("Contêiner não encontrado na posição atual.");
      return false;
    }

    if (currentStack.containers.length > 0) {
      const lastContainerInCurrentStack = currentStack.containers[currentStack.containers.length - 1];
      if (lastContainerInCurrentStack.id !== container.id) {
        console.log("Somente o contêiner no topo da pilha pode ser movido.");
        return false;
      }
    }

    if (newPosition.length !== 1 || newPosition < "A" || newPosition > "J") {
      console.log("Posição de empilhamento inválida.");
      return false;
    }

    // Verificar se a posição de destino está cheia
    const targetStack = this.portSystem.yard.stacks.find(
      (stack) => stack.position === newPosition
    );

    if (targetStack.isFull()) {
      console.log("A posição de empilhamento de destino está cheia.");
      return false;
    }

    // Mover o contêiner
    const sourceStack = this.portSystem.yard.stacks.find(
      (stack) => stack.containers.includes(container)
    );

    if (!sourceStack) {
      console.log("Contêiner não encontrado na posição atual.");
      return false;
    }

    sourceStack.containers = sourceStack.containers.filter(
      (c) => c !== container
    );
    targetStack.pushContainer(container);
    return true;
  }
}

module.exports = { PortCrane };