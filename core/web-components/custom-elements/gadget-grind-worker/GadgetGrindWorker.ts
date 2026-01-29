import { GadgetGrindElement } from '../../common/GadgetGrindElement';
import { GadgetGrindEmoji } from '../../../GadgetGrindEmoji';
import sharedStyles from '../../common/shared-styles';

export class GadgetGrindWorker extends GadgetGrindElement {

    static readonly inventoryMax = 2;
    static readonly recipe = {
        components: [ '🏵', '🍔' ],
        output: '📠'
    };
    static profile = {
        strength: 16,
        dexterity: 16,
        charisma: 10,
        affiliation: 'international workers of the world'
    };
    static readonly localStyles = `
        <style>
            #container {
                user-select: none; 
                font-size: 36px;
                padding: 5px;
                border: 1px dotted red;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            #icon {
                font-size: 36px;
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
            <div id="inventory">
                <gadget-grind-assembly icon="🏵"></gadget-grind-assembly>
                <gadget-grind-assembly icon="🍔"></gadget-grind-assembly>
            </div>
        </div>
        `;

    private container: HTMLElement | null = null;
    private icon: string | null = null;
    private status: string | null = 'ready';
    private weight: number | null = 100;
    private workTime: number | null = 4;
    private workCount: number | null = 0;
    private inventory: string[] | null = [];

    static get observedAttributes(): string[] { 
        return [...super.baseObservedAttributes, 'icon' ];
    }

    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = sharedStyles
            + GadgetGrindWorker.localStyles
            + GadgetGrindWorker.html;
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
        this.icon = GadgetGrindEmoji.getRandomAnimalEmoji();
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
        console.log(assembly);
    }

    handleEvent = (evt: any) => {
        console.log(`${evt.type} ${evt.detail.cmd}`);
        if (evt.detail.cmd === 'step') {
            this.handleStep(evt.detail.content);
        }
        if (evt.detail.cmd === 'take-assembly') {
            console.log('take assembly');
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
