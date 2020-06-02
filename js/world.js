import {SimplexNoise} from "/js/noise.js";
import {Cell} from "/js/cell.js";

class World {
    constructor(canvas, params = {}) {
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
        this.islandFilterLevel = 2;

        // Initialise other variables
        this.padding = {
            width: this.canvas.width % this.cellSize,
            height: this.canvas.height % this.cellSize
        }
        this.dimensions = {
            x: Math.floor(this.canvas.width / this.cellSize),
            y: Math.floor(this.canvas.height / this.cellSize)
        }
        
        // Initialise noise
        this.noise = new SimplexNoise();

        // Initialise cells
        this.cells = [];

        // Coordinates of the center of the world
        let center = {
            x: this.dimensions.x / 2,
            y: this.dimensions.y / 2
        }
        // Max distance from the center of the world
        let maxDistance = Math.hypot(center.x, center.y);

        for (let x = 0; x < this.dimensions.x; x++) {
            this.cells.push([]);
            
            for (let y = 0; y < this.dimensions.y; y++) {
                // Generate the height map
                let height = this.noise.octave(x, y, this.noiseIterations, this.noisePersistance, this.noiseScale);
                
                // Lower distances as it gets further from the center
                let distance = Math.hypot(center.x - x, center.y - y);
                height *= 1 - Math.pow(distance / maxDistance, this.islandFilterLevel);

                this.cells[x].push(new Cell(x, y, height));
            }
        }

        requestAnimationFrame(this.draw.bind(this));
    }

    draw() {
        // Clear the old canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        // Move so the canvas can be centered
        this.ctx.translate(this.padding.width / 2, this.padding.height / 2);

        // Do any actual drawing here
        this.cells.forEach((row) => {
            row.forEach((cell) => {
                this.ctx.fillStyle = cell.color;
                this.ctx.fillRect(cell.x * this.cellSize, cell.y * this.cellSize, this.cellSize, this.cellSize);
            });
        });

        // Restore the canvas back to how it was
        this.ctx.restore();
        requestAnimationFrame(this.draw.bind(this));
    }
}

export { World };