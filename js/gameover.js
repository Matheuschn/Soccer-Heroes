// Importa a próxima cena e a variável game
import { menuScene } from "./menu.js";

// Cria a cena de início
const gameoverScene = new Phaser.Scene("gameoverScene");

// A função init recebe a informação sobre o modo de jogo
gameoverScene.init = function(data) {
  this.scoreLeft = data.scoreLeft;
  this.scoreRight = data.scoreRight;
};

gameoverScene.preload = function() {
  this.load.image("continue", "assets/images/continuebutton.png");
  this.load.image("placar", "assets/images/placar.png");

};

gameoverScene.create = function() {
  // Adiciona o texto e espera o clique do usuário
  let halfWidth = this.scale.width / 2;
  let halfHeight = this.scale.height / 2;

  this.add.image(halfWidth, halfHeight - 100, "placar", {
    })
    .setOrigin(0.5);
  this.add
    .text(halfWidth, halfHeight, this.scoreLeft + " - " + this.scoreRight, {
      fontSize: "32px",
      fill: "#000"
    })
    .setOrigin(0.5);

  let continueButton = this.add.image(halfWidth, halfHeight + 150, "continue", {
    }).setInteractive().setScale(0.8);
  continueButton.on("pointerdown", () => this.scene.start(menuScene));
};

// Exporta a cena
export { gameoverScene };
