class BtnVoltar extends HTMLElement {
    constructor() {
        super()

        const shadow = this.attachShadow({mode: 'open'})
        
        shadow.appendChild(this.style())
        shadow.appendChild(this.link())
    }

    style () {
        const style = window.document.createElement('style')
        style.textContent = `
            .btn-voltar-link {
                width: min-content;
                display: block;
                color: #ffffff;
                fill: #ffffff;
                padding-left: 1%;
                margin-top: 1%;
            }
        `
        return style
    }

    link () {
        const link = window.document.createElement('a')
        link.title = 'Voltar'
        link.href = this.getAttribute('voltar')
        link.classList.add('btn-voltar-link')
        link.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="45px" height="45px" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"/>
            </svg>
        `
        return link
    }
}

customElements.define('btn-voltar', BtnVoltar)