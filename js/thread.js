class Thread {
    constructor(name, initData, transferables) {
        this.messages = {};

        this.worker = new Worker(`/js/workers/${name}.js`, {type: "module"});
        this.worker.addEventListener("message", (e) => {
            let promiseResolve = this.messages[e.data.id];
            if (promiseResolve) {
                promiseResolve(e.data);
                this.messages[e.data.id] = undefined;
            }
        });

        this.send("init", initData, transferables);
    }

    send(type, data, transferables) {
        return new Promise((resolve) => {
            let id;

            do {
                id = Math.floor(Math.random() * Math.pow(10, 10)).toString(16);
            } while (this.messages[id]);

            this.messages[id] = resolve;
    
            this.worker.postMessage({
                type,
                data,
                id
            }, transferables);
        });
    }
}

export {Thread};