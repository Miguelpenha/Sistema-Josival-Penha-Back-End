class ColorFinanceiro extends HTMLElement {
    constructor() {
        super()

        const shadow = this.attachShadow({mode: 'open'})
        
        shadow.appendChild(this.style())
        shadow.appendChild(this.color())
        if (this.text()) {
            shadow.append(this.text())
        }
    }

    style () {
        const style = window.document.createElement('style')
        style.textContent = `
            .color {
                display: inline-block;
                width: 12px;
                height: 12px;
                background-color: ${this.getAttribute('color')};
                border-radius: 50%;
                ${this.text() ? 'margin-right: 2%;' : ''}
            }
        `
        
        return style
    }

    color () {
        const color = window.document.createElement('div')
        color.classList.add('color')

        return color
    }

    text () {
        if (this.firstChild) {
            return this.firstChild.data
        } else {
            return null
        }
    }
}

customElements.define('color-financeiro', ColorFinanceiro)