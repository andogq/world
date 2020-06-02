function generateChunk(chunkX, chunkY) {
    let chunk = [];

    for (let x = 0; x < this.chunkSize; x++) {
        chunk.push([]);
        let actualX = (chunkX * this.chunkSize) + x;
        
        for (let y = 0; y < this.chunkSize; y++) {
            let actualY = (chunkY * this.chunkSize) + y;

            // Generate the height map
            let height = this.noise.octave(actualX, actualY, this.noiseIterations, this.noisePersistance, this.noiseScale);
            
            // Lower distances as it gets further from the center
            let distance = Math.hypot(this.center.x - actualX, this.center.y - actualY);
            height *= 1 - Math.pow(distance / this.maxDistance, this.islandFilterLevel);

            chunk[x].push(new Cell(x, y, height));
        }
    }

    return chunk;
}

this.addEventListener("message", (e) => {
    let data = e.data;

    this.chunkSize = data.chunkSize;
    this
})