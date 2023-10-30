const { ContainerStack } = require('./ContainerStack');

class PortYard {
  constructor() {
    const stackPositions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

    this.stacks = stackPositions.map(p => {
      let stack = new ContainerStack(p)
      return stack;
    })
  }
}

module.exports = { PortYard };