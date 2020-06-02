import {SimplexNoise} from "/js/noise.js";

self.addEventListener("message", (e) => {
    let response = {
        success: true,
        id: e.data.id
    };
    let data = e.data.data || {};

    switch (e.data.type) {
        case "init":
            if (!self.noise) {
                self.seed = data.seed || Math.random();

                self.noise = new SimplexNoise(self.seed);
            }
            break;
        case "2d":
            if (typeof data.x == "number" && typeof data.y == "number") {
                response.noise = self.noise.noise2D(data.x, data.y);
            }
            break;
        case "octave":
            if (typeof data.x == "number" && typeof data.y == "number" && typeof data.iterations == "number"
                && typeof data.persistance == "number" && typeof data.scale == "number") {
                response.noise = self.noise.octave(data.x, data.y, data.iterations, data.persistance, data.scale);
            }
            break;
        default:
            response.success = false;
            break;
    }

    self.postMessage(response);
});