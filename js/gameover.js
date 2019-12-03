// Importa a próxima cena e a variável game
import { menuScene } from "./menu.js";

// Cria a cena de início
const gameoverScene = new Phaser.Scene("gameoverScene");

gameoverScene.preload = function() {
  this.load.image("sky", "assets/sky.png");
};

gameoverScene.create = function() {
  // Adiciona uma imagem e espera o clique do usuário
  let skyWidth = this.textures.get("sky").frames.__BASE.width;
  let skyHeight = this.textures.get("sky").frames.__BASE.height;
  this.add
    .image(0, 0, "sky")
    .setOrigin(0, 0)
    .setScale(this.scale.width / skyWidth, this.scale.height / skyHeight);
  
  let halfWidth = this.scale.width / 2;
  let halfHeight = this.scale.height / 2;
  let startButton = this.add.image(halfWidth, halfHeight, "start").setInteractive();
  startButton.on("pointerdown", () => this.scene.start(menuScene));
};

// Exporta a cena
export { gameoverScene };
