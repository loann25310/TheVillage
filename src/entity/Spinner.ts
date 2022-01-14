export class Spinner {

    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
        container.classList.add("spinner-container");
        for (let i = 0; i < 16; i++) {
            let div = document.createElement("div");
            div.classList.add("spinner-block");
            container.appendChild(div);
        }
    }

}