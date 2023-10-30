class Container {
    constructor(id, owner, cargoType, weight, operationType) {
      this.id = id;
      this.owner = owner;
      this.cargoType = cargoType;
      this.weight = weight;
      this.operationType = operationType;
    }
  }

module.exports = { Container };