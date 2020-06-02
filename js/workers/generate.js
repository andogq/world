self.addEventListener("message", (e) => {
    let data = e.data.data;
    switch (e.type) {
        case "init":
            self.noiseChannel = data.noiseChannel;
            self
    }
})

function generate() {

}