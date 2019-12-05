// Importa a próxima cena e a variável game
import { gameScene } from "./main.js";

// Cria a cena de início
const menuScene = new Phaser.Scene("menuScene");

menuScene.preload = function() {
  this.load.image("golbotao", "assets/images/golbotao.png");
  this.load.image("tempobotao", "assets/images/tempobotao.png");
};

menuScene.create = function() {
  // Adiciona uma imagem e espera o clique do usuário
  let halfWidth = this.scale.width / 2;
  let halfHeight = this.scale.height / 2;
  let logoImg = this.add.image(halfWidth, halfHeight - 200, "logo");
  let timeButton = this.add.image(halfWidth, halfHeight + 50, "tempobotao").setInteractive().setScale(0.8);
  let scoreButton = this.add.image(halfWidth, halfHeight + 200, "golbotao").setInteractive().setScale(0.8);

  timeButton.on("pointerdown", () => this.scene.start(gameScene, { isTimeGamemode: true, isGoalGamemode: false }));
  scoreButton.on("pointerdown", () => this.scene.start(gameScene, { isTimeGamemode: false, isGoalGamemode: true }));
};

// Exporta a cena
export { menuScene };
