import {Cell} from "/js/cell.js";

self.addEventListener("message", (e) => {
    let data = e.data.data;
    switch (e.data.type) {
        case "init":
            // Save the noise channel
            self.noiseChannel = e.ports[0];

            self.noiseRequests = [];
            self.noiseChannel.onmessage = (e) => {
                if (self.noiseRequests[e.data.id]) self.noiseRequests[e.data.id](e.data.noise);
            };

            // Save other variables
            self.size = data.size;
            self.center = data.center;
            self.maxDistance = data.maxDistance;
            self.islandFilterLevel = data.islandFilterLevel;
            break;
        case "generate":
            generate(data.x, data.y).then((chunk) => {
                self.postMessage({data: chunk, id: e.data.id});
            });
            break;
    }
});

function getNoise(x, y) {
    return new Promise((resolve) => {
        let id = self.noiseRequests.length;
        self.noiseRequests.push(resolve);

        self.noiseChannel.postMessage({type: "octave", data: {x, y}, id});
    });
}

function generate(chunkX, chunkY) {
    let promises = [];

    for (let x = 0; x < self.size; x++) {
        let rowPromises = [];

        let actualX = (chunkX * self.size) + x;
        
        for (let y = 0; y < self.size; y++) {
            let actualY = (chunkY * self.size) + y;

            // Generate the height map
            rowPromises.push(getNoise(actualX, actualY).then((noise) => {
                // Lower distances as it gets further from the center
                let distance = Math.hypot(self.center.x - actualX, self.center.y - actualY);
                let height = noise * (1 - Math.pow(distance / self.maxDistance, self.islandFilterLevel));

                if (isNaN(Number(height))) console.log(height)

                return new Cell(x, y, height);
            }));
        }

        promises.push(Promise.all(rowPromises));
    }

    return Promise.all(promises);
}