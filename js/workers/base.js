import {Channel} from "/js/channel.js";

class Base extends Channel {
    constructor(init, incommingCommand) {
        super(self, (type, data, ports) => {
            // Check if it's the init command
            if (type == "init" && !this.init) return init(data).then((res) => {
                // Set initialised to true
                this.init = true;
                // Run everything in the queue
                this.queue.forEach((p) => this.incomming(p.type, p.data, p.ports));
                // Return the result of the initialisation
                return res;
            });
            // Check if it's an attachment command
            else if (type == "attach" && ports && this.init) return new Promise((resolve) => {
                ports.forEach((port) => {
                    new Channel(port, this.incomming);
                });
                resolve();
            });
            // Run custom function for the command
            else if (this.init) return incommingCommand(type, data);
            // Queue the commands to be run once initialised
            else {
                this.queue.push({type, data, ports});
                return Promise.resolve();
            }
        });

        this.init = false;
        this.queue = [];
    }
}

export {Base};