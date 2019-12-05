// Importa a próxima cena e a variável game
import { menuScene } from "./menu.js";

// Cria a cena de início
const startScene = new Phaser.Scene("startScene");

startScene.preload = function() {
  this.load.image("start", "assets/images/start.png");
};

startScene.create = function() {
  // Adiciona uma imagem e espera o clique do usuário
  let halfWidth = this.scale.width / 2;
  let halfHeight = this.scale.height / 2;
  let startButton = this.add.image(halfWidth, halfHeight, "start").setInteractive();
  startButton.on("pointerdown", () => this.scene.start(menuScene));
};

// Exporta a cena
export { startScene };
