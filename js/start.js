// Importa a próxima cena e a variável game
import { menuScene } from "./menu.js";

// Cria a cena de início
const startScene = new Phaser.Scene("startScene");

startScene.preload = function() {
  this.load.image("start", "assets/images/start.png");
  this.load.video("intro", "assets/video/intro.mp4", "loadeddata", false, true);
  this.load.image("logo", "assets/images/logo.png");
};

startScene.create = function() {
  let halfWidth = this.scale.width / 2;
  let halfHeight = this.scale.height / 2;

  var video = this.add.video(halfWidth, halfHeight, "intro");

  // Roda a animação padrão e o vídeo
  video.play();
  video.on(
    "complete",
    function(video) {
      // Adiciona uma imagem e espera o clique do usuário
      let logoImg = this.add.image(halfWidth, halfHeight - 200, "logo");
      let startButton = this.add
        .image(halfWidth, halfHeight + 50, "start")
        .setInteractive();
      startButton.on("pointerdown", () => this.scene.start(menuScene));
    },
    this
  );
};

// Exporta a cena
export { startScene };
