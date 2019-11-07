// Importa a próxima cena
import { mainScene } from "./main.js";

// Cria a cena de início
var startScene = new Phaser.Scene("StartScene");

startScene.preload = function() {
  this.load.image("start", "assets/start.png");
};

startScene.create = function() {
  // Adiciona uma imagem e espera o clique do usuário
  const startButton = this.add.image(400, 300, "start").setInteractive();
  startButton.on("pointerdown", () => this.scene.start(mainScene));
};

// Exporta a cena
export { startScene };
