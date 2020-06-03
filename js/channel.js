class Channel {
    constructor(port, incomming) {
        this.port = port;
        this.incomming = incomming;

        this.requests = [];

        this.port.onmessage = (e) => {
            let packet = e.data;
            let ports = e.ports;

            if (packet.type == "response") {
                if (this.requests[packet.id]) {
                    this.requests[packet.id](packet.data);
                }
            } else if (this.incomming) {
                this.incomming(packet.type, packet.data, ports).then((data) => {
                    let response = {
                        type: "response",
                        data,
                        id: packet.id
                    };

                    self.postMessage(response);
                });
            }
        }
    }

    send(type, data, transferables) {
        return new Promise((resolve) => {
            let id = this.requests.length;

            let packet = {
                type,
                data,
                id
            }

            this.requests.push(resolve);

            this.port.postMessage(packet, transferables);
        });
    }
}

export {Channel};