import { GadgetGrindElement } from '../../common/GadgetGrindElement';
import { GadgetGrindEmoji } from '../../../GadgetGrindEmoji';
import sharedStyles from '../../common/shared-styles';

export class GadgetGrindConveyor extends GadgetGrindElement {

    static readonly maxLength = 10;
    static readonly componentLibraryLength = 3;
    static componentLibrary = [
        { component : '<gadget-grind-assembly icon="🏵"></gadget-grind-assembly>', weight: 1 },
        { component : '<gadget-grind-assembly icon="🍔"></gadget-grind-assembly>', weight: 1 },
        { component : '', weight: 1 }
    ]
    static readonly localStyles = `
        <style>
            #container-wrapper {
                display: flex;
                align-items: center;
            }
            #container {
                user-select: none; 
                font-size: 36px;
                padding: 5px;
                border: 1px dotted red;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            #conveyor {
                display: flex;
                justify-content: space-between;
            }
            .worker-row {
                display: flex;
                justify-content: space-between;
            }
            .conveyor-cell {
                width: 80px;
                height: 80px;
                background-color: #333333;
                opacity: 1.0;
                border: 5px solid white;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .worker-cell {
                width: 80px;
                height: 80px;
                background-color: #ffffaa;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            #parts-bin {
                display: grid;
                grid: auto / auto auto auto auto auto auto auto auto auto auto;
                font-size: 12px;
                border: 5px solid #333333;
                background-color: #ffffaa;
                margin: 10px;
                max-width: 250px;
                min-height: 50px;
                min-width: 250px;
                overflow: scroll-y;
            }
            #parts-bin-wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            #count {
                width: 80%;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
        </style>
        `;
  
    static readonly html = `
    <div id="container-wrapper">
        <div id="container">
            <div id="worker-row-top" class="worker-row">
                <div id="worker-cell-1" class="worker-cell">🐰</div>
                <div id="worker-cell-2" class="worker-cell">🐰</div>
                <div id="worker-cell-3" class="worker-cell">🐰</div>
                <div id="worker-cell-4" class="worker-cell">🐰</div>
                <div id="worker-cell-5" class="worker-cell">🐰</div>
                <div id="worker-cell-6" class="worker-cell">🐰</div>
            </div>
            <div id="conveyor">
                <div id="cell-1" class="conveyor-cell">
                    <gadget-grind-assembly icon="🏵"></gadget-grind-assembly>
                </div>
                <div id="cell-2" class="conveyor-cell">
                    <gadget-grind-assembly icon="🍔"></gadget-grind-assembly>
                </div>
                <div id="cell-3" class="conveyor-cell"></div>
                <div id="cell-4" class="conveyor-cell">
                    <gadget-grind-assembly icon="🏵"></gadget-grind-assembly>
                </div>
                <div id="cell-5" class="conveyor-cell">
                    <gadget-grind-assembly icon="🍔"></gadget-grind-assembly>
                </div>
                <div id="cell-6" class="conveyor-cell"></div>
            </div>
            <div id="worker-row-bottom" class="worker-row">
                <div id="worker-cell-1" class="worker-cell">🐰</div>
                <div id="worker-cell-2" class="worker-cell">🐰</div>
                <div id="worker-cell-3" class="worker-cell">🐰</div>
                <div id="worker-cell-4" class="worker-cell">🐰</div>
                <div id="worker-cell-5" class="worker-cell">🐰</div>
                <div id="worker-cell-6" class="worker-cell">🐰</div>
            </div>
        </div>
        <div id="parts-bin-wrapper">
            <div id="parts-bin"></div>
            <div id="count"><span>🏵: 0</span><span>🍔: 0</span></div>
        </div>
    </div>
        `;

    private container: HTMLElement | null = null;
    private length: number | null = 6;

    static get observedAttributes(): string[] { 
        return [...super.baseObservedAttributes, 'length' ];
    }

    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = sharedStyles
            + GadgetGrindConveyor.localStyles
            + GadgetGrindConveyor.html;
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
        this.addEventListener(`${this.id}`, this.handleEvent);
    }
    
    teardown = () => {
        this.unsubscribe(this.observedMessages);
    }

    handleStep = () => {
        console.log('conveyor handle step');
        let lastCell = this.shadowRoot!.querySelector('#conveyor')!.lastElementChild as HTMLElement;
        let lastCellContents = lastCell.lastElementChild as HTMLElement;
        if (lastCellContents) {
            this.shadowRoot!.querySelector('#parts-bin')!.prepend(lastCellContents);
        } 
        this.shadowRoot!.querySelector('#conveyor')!.prepend(lastCell);
        let htmlString: string = GadgetGrindConveyor.componentLibrary[Math.floor(Math.random() * GadgetGrindConveyor.componentLibraryLength)].component;
        lastCell.innerHTML = htmlString;
    }

    handleEvent = (evt: any) => {
        console.log(`${evt.type} ${evt.detail.cmd}`);
        if (evt.detail.cmd === 'step') {
            this.handleStep();
        }
    }

    attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        // Call the parent's attributeChangedCallback to preserve its behavior
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === 'length') {
            this.length = parseInt((newValue as string), 10);
        }
    }
}
