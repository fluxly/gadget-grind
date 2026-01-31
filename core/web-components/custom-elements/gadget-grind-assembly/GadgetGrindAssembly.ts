import { GadgetGrindElement } from '../../common/GadgetGrindElement';
import { GadgetGrindEmoji } from '../../../GadgetGrindEmoji';
import sharedStyles from '../../common/shared-styles';

export class GadgetGrindAssembly extends GadgetGrindElement {

    static readonly localStyles = `
        <style>
            #container {
                user-select: none; 
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 5px;
            }
            #components {
                display: flex;
                font-size: 10px;
                opacity: 0.5;
            }
        </style>
        `;
  
    static readonly html = `
        <div id="container">
            <div id="icon">🧶</div>
            <div id="components">
            <slot></slot>
            </div>
        </div>
        `;

    private container: HTMLElement | null = null;
    public icon: string | null = null;

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
        this.shadowRoot!.querySelector('#icon')!.innerHTML = (this.icon as string);
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
