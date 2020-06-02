const colors = {
    deepWater: "#3258a6",
    water: "#3299d1",
    sand: "#edca00",
    grass: "#40ad15",
    forest: "#007a06",
    stone: "#858a83",
    snow: "#e6e6e6"
}
const colorScale = {
    0: "deepWater",
    0.1: "water",
    0.3: "sand",
    0.32: "grass",
    0.45: "forest",
    0.65: "stone",
    0.75: "snow"
}

class Cell {
    constructor(x, y, height) {
        this.x = x;
        this.y = y;

        if (!(height >= 0 && height <= 1)) console.log(height)
        this.height = height || 0;
        this.locked = false;
    }

    get color() {
        let color = 0;

        Object.keys(colorScale).forEach((height) => {
            height = Number(height);
            if (this.height > height) color = height;
        });
        return colors[colorScale[color]];
    }

    get height() {
        return this._height;
    }
    set height(height) {
        if (height >= 0 && height <= 1 && !this.locked) this._height = height;
    }
}

export { Cell };