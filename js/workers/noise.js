import {SimplexNoise} from "/js/noise.js";

function message(type, data = {}, id, responder) {
    let response = {
        success: true,
        id
    }

    switch (type) {
        case "init":
            if (!self.noise) {
                self.seed = data.seed || Math.random();

                self.iterations = data.iterations;
                self.persistance = data.persistance;
                self.scale = data.scale;

                self.noise = new SimplexNoise(self.seed);
            }
            break;
        case "2d":
            if (typeof data.x == "number" && typeof data.y == "number") {
                response.noise = self.noise.noise2D(data.x, data.y);
            }
            break;
        case "octave":
            if (typeof data.x == "number" && typeof data.y == "number") {
                response.noise = self.noise.octave(data.x, data.y, self.iterations, self.persistance, self.scale);
            }
            break;
        default:
            response.success = false;
            break;
    }

    responder.postMessage(response);
}

self.addEventListener("message", (e) => {
    if (e.data.type == "attach") {
        let channel = e.ports[0];
        channel.onmessage = (e) => message(e.data.type, e.data.data, e.data.id, channel);
    } else {
        message(e.data.type, e.data.data, e.data.id, self);
    }
});