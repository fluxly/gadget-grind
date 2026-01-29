import { GadgetGrindElement } from '../../common/GadgetGrindElement';
import { GadgetGrindEmoji } from '../../../GadgetGrindEmoji';
import sharedStyles from '../../common/shared-styles';

export class GadgetGrindConductor extends GadgetGrindElement {

    static readonly localStyles = `
        <style>
            #container {
            font-family: Quantico;
                user-select: none; 
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background-color: #ffffff;
                width: 120px;
                height: 120px;
                border: 10px solid rgba(255, 255, 0, 1);
                border-radius: 50%;
            }
            #icon {
                font-size: 72px;
            }
            #inventory, #status {
                display: flex;
                border: none;
                font-size: 12px;
            }
            .status {
                display: none;
            }
            .status-active {
                display: block;
            }
        </style>
        `;
  
    static readonly html = `
        <div id="container">
            <div id="status">
                <span id="ready" class="status status-active">🟢</span>
                <span id="busy" class="status">🔴</span>
                <span id="making" class="status">🟡</span>
            </div>
            <div id="icon"></div>
        </div>
        `;

    private container: HTMLElement | null = null;
    private icon: string | null = '🐐';
    private status: string | null = 'ready';
    private speed: number | null = 2;
    private stepCount: number | null = 0;

    static get observedAttributes(): string[] { 
        return [...super.baseObservedAttributes, 'icon' ];
    }

    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = sharedStyles
            + GadgetGrindConductor.localStyles
            + GadgetGrindConductor.html;
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
        this.observedMessages = [`${this.id}`];
        this.subscribe(this.observedMessages); 
        this.shadowRoot!.querySelector('#icon')!.innerHTML = (this.icon as string);
        this.addEventListener(`${this.id}`, this.handleEvent);
        this.setStatus('ready');
    }
    
    teardown = () => {
        this.unsubscribe(this.observedMessages);
    }

    handleStep = (assembly: string) => {
        console.log('handle step');
    }

    handleEvent = (evt: any) => {
        console.log(`${evt.type} ${evt.detail.cmd}`);
        if (evt.detail.cmd === 'step') {
            this.handleStep(evt.detail.content);
        }
        if (evt.detail.cmd === 'arbitrate') {
            console.log('arbitrate');
        }
    }

    setStatus(s: string) {
        this.shadowRoot!.querySelector(`#${this.status}`)?.classList.toggle('status-active');
        this.status = s;
        this.shadowRoot!.querySelector(`#${this.status}`)?.classList.toggle('status-active');
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
