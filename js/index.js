// Importa todas cenas do jogo
import { startScene } from "./start.js";
import { mainScene } from "./main.js";

// Configurando a instância do Phaser
const config = {
  type: Phaser.AUTO,
  width: 1366,
  height: 768,
  backgroundColor: "#f3cca3",
  physics: {
    default: "matter", // Define a engine de física MatterJS
    matter: {
      debug: true
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "game",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1366,
    height: 768
  },
  plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin, // Plugin para facilitar as colisões no Matter
        key: "matterCollision",
        mapping: "matterCollision"
      }
    ]
  },
  scene: [startScene, mainScene]
};

// Inicia o jogo com as configurações definidas acima
const game = new Phaser.Game(config);

export { game };
