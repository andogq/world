import {Channel} from "/js/channel.js";

class Thread extends Channel {
    constructor(name, initData) {
        super(new Worker(`/js/workers/${name}.js`, {type: "module"}));

        this.send("init", initData).then(() => console.log("Init completed"));
    }
}

export {Thread}