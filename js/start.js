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
  const startButton = this.add
    .image(game.scale.width / 2, game.scale.height / 2, "start")
    .setInteractive();
  startButton.on("pointerdown", () => this.scene.start(mainScene));
};

// Exporta a cena
export { startScene };
