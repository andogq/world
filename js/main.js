import {World} from "/js/world.js";

function init() {
    window.world = new World(document.getElementById("world"), {
        cellSize: 10,
        seed: 0.60888671875
    });
}

init();