import {Base} from "/js/workers/base.js";
import {SimplexNoise} from "/js/noise.js";

new Base((data) => {
    self.seed = data.seed || Math.random();

    self.iterations = data.iterations;
    self.persistance = data.persistance;
    self.scale = data.scale;

    self.noise = new SimplexNoise(self.seed);

    return Promise.resolve();
}, (type, data) => {
    let noise = 0;
    switch (type) {
        case "2d":
            if (typeof data.x == "number" && typeof data.y == "number") {
                noise = self.noise.noise2D(data.x, data.y);
            }
            break;
        case "octave":
            if (typeof data.x == "number" && typeof data.y == "number") {
                noise = self.noise.octave(data.x, data.y, self.iterations, self.persistance, self.scale);
            }
            break;
    }
    return Promise.resolve(noise);
});