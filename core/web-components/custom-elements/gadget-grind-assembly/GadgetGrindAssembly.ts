import { GadgetGrindElement } from '../../common/GadgetGrindElement';
import { GadgetGrindEmoji } from '../../../GadgetGrindEmoji';
import sharedStyles from '../../common/shared-styles';

export class GadgetGrindAssembly extends GadgetGrindElement {

    static readonly localStyles = `
        <style>
            #container {
                user-select: none; 
                font-size: 72px;
                margin: 10px;
            }
        </style>
        `;
  
    static readonly html = `
        <div id="container">
        🧶
        </div>
        `;

    private container: HTMLElement | null = null;
    private icon: string | null = null;

    static get observedAttributes(): string[] { 
        return [...super.baseObservedAttributes, 'icon' ];
    }

    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = sharedStyles
            + GadgetGrindAssembly.localStyles
            + GadgetGrindAssembly.html;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.appendChild(template.content.cloneNode(true));
        this.initialize();
    }
  
    connectedCallback() {
        this.setup();
    }
    
    disconnectedCallback() {
        this.teardown();
    }
    
    initialize() {
        this.container = this.shadowRoot!.querySelector('#container');
    }
  
    setup = () => {
        this.observedMessages = [];
        this.subscribe(this.observedMessages);   
    }
    
    teardown = () => {
        this.unsubscribe(this.observedMessages);
    }

    attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        // Call the parent's attributeChangedCallback to preserve its behavior
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === 'icon') {
            this.icon = newValue;
        }
    }
}
