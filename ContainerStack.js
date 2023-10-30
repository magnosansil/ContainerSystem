class ContainerStack {
    constructor(position) {
      this.position = position;
      this.containers = [];
    }
  
    pushContainer(container) {
      let verifier;

      if (this.containers.length < 5) {
        this.containers.push(container);
        verifier = true;
      } else {
        verifier = false;
      }
      return verifier;
    }
  
    popContainer(containerId) {
      let verifier
      const containerIndex = this.containers.findIndex((c) => c.id === containerId);
      if (containerIndex !== -1) {
        const removedContainer = this.containers.splice(containerIndex, 1)[0];
        console.log(`Contêiner ${removedContainer.id} excluído com sucesso.`);
        verifier = true;
      } else {
        verifier = false;
      }
      return verifier;
    }
    
  
    getTopContainer() {
      return this.containers.length > 0 ? this.containers[this.containers.length - 1] : null;
    }
  
    isEmpty() {
      return this.containers.length === 0;
    }
  
    isFull() {
      return this.containers.length === 5;
    }
  }
  
module.exports = { ContainerStack };