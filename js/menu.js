// Importa a próxima cena e a variável game
import { gameScene } from "./main.js";

// Cria a cena de início
const menuScene = new Phaser.Scene("menuScene");

menuScene.preload = function() {
  this.load.image("sky", "assets/sky.png");
};

menuScene.create = function() {
  // Adiciona uma imagem e espera o clique do usuário
  let halfWidth = this.scale.width / 2;
  let halfHeight = this.scale.height / 2;
  let timeButton = this.add.text(halfWidth, halfHeight - 200, "TEMPO", { fontSize: "32px", fill: "#000" }).setInteractive();
  let scoreButton = this.add.text(halfWidth, halfHeight + 200, "GOLS", { fontSize: "32px", fill: "#000" }).setInteractive();

  timeButton.on("pointerdown", () => this.scene.start(gameScene, { isTimeGamemode: true, isGoalGamemode: false }));
  scoreButton.on("pointerdown", () => this.scene.start(gameScene, { isTimeGamemode: false, isGoalGamemode: true }));
};

// Exporta a cena
export { menuScene };
