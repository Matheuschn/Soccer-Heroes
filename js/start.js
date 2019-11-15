// Importa a próxima cena e a variável game
import { mainScene } from "./main.js";
import { game } from "./index.js";

// Cria a cena de início
const startScene = new Phaser.Scene("StartScene");

startScene.preload = function() {
  this.load.image("start", "assets/start.png");
};

startScene.create = function() {
  // Adiciona uma imagem e espera o clique do usuário
  let halfWidth = game.scale.width / 2;
  let halfHeight = game.scale.height / 2;
  let startButton = this.add.image(halfWidth, halfHeight, "start").setInteractive();
  startButton.on("pointerdown", () => this.scene.start(mainScene));
};

// Exporta a cena
export { startScene };
