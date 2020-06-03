import {Cell} from "/js/cell.js";
import { Thread } from "/js/thread.js";

class World {
    constructor(canvas, params = {}) {
        console.time("World Initialisation");
        // Initialise the canvas
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        {
            let style = window.getComputedStyle(this.canvas);
            this.canvas.height = Number(style.height.replace("px", ""));
            this.canvas.width = Number(style.width.replace("px", ""));
        }

        // Initialise the parameters
        this.cellSize = params.cellSize || 1; // Size of each cell
        this.noiseIterations = params.noiseIterations || 10;
        this.noisePersistance = params.noisePersistance || 0.5;
        this.noiseScale = params.noiseScale || 0.003;
        this.islandFilterLevel = params.islandFilterLevel || 2;
        this.seed = params.seed || Math.random();
        this.chunkSize = params.chunkSize || 100;

        // Initialise other variables
        this.padding = {
            width: this.canvas.width % this.cellSize,
            height: this.canvas.height % this.cellSize
        }
        this.dimensions = {
            x: Math.floor(this.canvas.width / this.cellSize),
            y: Math.floor(this.canvas.height / this.cellSize)
        }
        this.center = {
            x: this.dimensions.x / 2,
            y: this.dimensions.y / 2
        }
        // Max distance from the center of the world
        this.maxDistance = Math.hypot(this.center.x, this.center.y);
        
        // Initialise noise
        this.noise = new Thread("noise", {
            seed: this.seed,
            iterations: this.noiseIterations,
            persistance: this.noisePersistance,
            scale: this.noiseScale
        });

        this.noise.send("2d", {x: 0, y: 0}).then(console.log)

        console.time("Cell Generating");

        // // Create message channel for new thread
        // let c = new MessageChannel();
        // // Send it to the noise thread
        // this.noise.send("attach", undefined, [c.port2]);
        // // Make the new thread
        // let t = new Thread("generate", {
        //     size: this.chunkSize,
        //     center: this.center,
        //     maxDistance: this.maxDistance,
        //     islandFilterLevel: this.islandFilterLevel
        // }, [c.port1]);
        // t.send("generate", {x: 0, y: 0}).then(({data}) => {
        //     this.chunks[0][0] = data;
        // });

        this.chunks = [[]];


        // TODO: Convert current workers to utilise the base class
        // TODO: Make sure that noise is using the Thread class correctly
        // TODO: Make single chunk generate from thread
        // TODO: Make threads to generate all the chunks

        // Initialise cells
        // let promises = [];
        
        // for (let x = 0; x < this.dimensions.x / this.chunkSize; x++) {
        //     let rowPromises = [];

        //     for (let y = 0; y < this.dimensions.y / this.chunkSize; y++) {
        //         rowPromises.push(this.generateChunk(x, y));
        //     }

        //     promises.push(Promise.all(rowPromises));
        // }

        // Promise.all(promises).then((chunks) => {
        //     this.chunks = chunks;
        //     console.timeEnd("Cell Generating");

        //     console.timeEnd("World Initialisation");
        // });
        requestAnimationFrame(this.draw.bind(this));
    }

    generateChunk(chunkX, chunkY) {
        let promises = [];

        for (let x = 0; x < this.chunkSize; x++) {
            let rowPromises = [];

            let actualX = (chunkX * this.chunkSize) + x;
            
            for (let y = 0; y < this.chunkSize; y++) {
                let actualY = (chunkY * this.chunkSize) + y;

                // Generate the height map
                rowPromises.push(this.noise.send("octave", {
                    x: actualX,
                    y: actualY
                }).then(({noise}) => {
                    // Lower distances as it gets further from the center
                    let distance = Math.hypot(this.center.x - actualX, this.center.y - actualY);
                    let height = noise * (1 - Math.pow(distance / this.maxDistance, this.islandFilterLevel));
    
                    return new Cell(x, y, height);
                }));
            }

            promises.push(Promise.all(rowPromises));
        }

        return Promise.all(promises);
    }

    draw() {
        // Clear the old canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        // Move so the canvas can be centered
        this.ctx.translate(this.padding.width / 2, this.padding.height / 2);

        // Do any actual drawing here
        this.chunks.forEach((row, chunkX) => {
            row.forEach((chunk, chunkY) => {
                chunk.forEach((row) => {
                    row.forEach((cell) => {
                        let actualX = (chunkX * this.chunkSize) + cell.x;
                        let actualY = (chunkY * this.chunkSize) + cell.y;

                        if (actualX * this.cellSize < this.canvas.width - this.padding.width && actualY * this.cellSize < this.canvas.height - this.padding.height) {
                            this.ctx.fillStyle = cell.color;
                            this.ctx.fillRect(actualX * this.cellSize, actualY * this.cellSize, this.cellSize, this.cellSize);
                        }
                    });
                });
            });
        });
        

        // Restore the canvas back to how it was
        this.ctx.restore();
        requestAnimationFrame(this.draw.bind(this));
    }
}

export { World };