import { GadgetGrindElement } from '../../common/GadgetGrindElement';
import type { GadgetGrindWorker } from '../gadget-grind-worker/GadgetGrindWorker';
import type { GadgetGrindAssembly } from '../gadget-grind-assembly/GadgetGrindAssembly';
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
                margin: 20px;
            }
            #container {
                user-select: none; 
                font-size: 36px;
                padding: 20px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                background-color: #aaff00;
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
                border: 5px solid #cccccc;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .worker-cell {
                width: 80px;
                height: 180px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            #parts-bin {
                display: grid;
                grid: auto / auto auto auto auto auto;
                font-size: 12px;
                border: 5px solid #333333;
                background-color: #ffffaa;
                margin: 10px;
                max-width: 300px;
                min-height: 50px;
                min-width: 300px;
                max-height: 250px;
                overflow-y: scroll;
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
                <div id="worker-cell-1" class="worker-cell group-1"></div>
                <div id="worker-cell-2" class="worker-cell group-2"></div>
                <div id="worker-cell-3" class="worker-cell group-3"></div>
                <div id="worker-cell-4" class="worker-cell group-4"></div>
                <div id="worker-cell-5" class="worker-cell group-5"></div>
                <div id="worker-cell-6" class="worker-cell group-6"></div>
            </div>
            <div id="conveyor">
                <div id="cell-2" style="background-color: #222222;" class="conveyor-cell"></div>
                <div id="cell-3" style="background-color: #444444;" class="conveyor-cell"></div>
                <div id="cell-4" style="background-color: #666666;" class="conveyor-cell"></div>
                <div id="cell-5" style="background-color: #888888;" class="conveyor-cell"></div>
                <div id="cell-6" style="background-color: #aaaaaa;" class="conveyor-cell"></div>
                <div id="cell-1" style="background-color: #000000;" class="conveyor-cell"></div>
            </div>
            <div id="worker-row-bottom" class="worker-row">
                <div id="worker-cell-7" class="worker-cell group-1"></div>
                <div id="worker-cell-8" class="worker-cell group-2"></div>
                <div id="worker-cell-9" class="worker-cell group-3"></div>
                <div id="worker-cell-10" class="worker-cell group-4"></div>
                <div id="worker-cell-11" class="worker-cell group-5"></div>
                <div id="worker-cell-12" class="worker-cell group-6"></div>
            </div>
        </div>
        <div id="parts-bin-wrapper">
            <div id="parts-bin"></div>
            <div id="count"><span>🏵: 0</span><span>🍔: 0</span></div>
        </div>
        <slot></slot>
    </div>
        `;

    private container: HTMLElement | null = null;
    private length: number = 6;
    private conveyorIndex: number = 0;
    private workerGroups: HTMLElement[][] | null = [];

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
        this.observedMessages = [`${this.id}`, 'step'];
        this.subscribe(this.observedMessages); 
        this.addEventListener(`${this.id}`, this.handleEvent);
        this.addEventListener('step', this.handleStep);
        const slot = this.shadowRoot!.querySelector('slot');
        const workers = slot?.assignedElements() ?? [];
        let count = 0;
        for (let worker of workers) {
            count++;
            this.shadowRoot!.querySelector(`#worker-cell-${count}`)?.appendChild(worker);
        }
    }
    
    teardown = () => {
        this.unsubscribe(this.observedMessages);
    }

    handleStep = async () => {
        // move the conveyor
        let lastCell = this.shadowRoot!.querySelector('#conveyor')!.lastElementChild as HTMLElement;
        let lastCellContents = lastCell.lastElementChild as HTMLElement;
        if (lastCellContents) {
            this.shadowRoot!.querySelector('#parts-bin')!.prepend(lastCellContents);
        } 
        this.shadowRoot!.querySelector('#conveyor')!.prepend(lastCell);
        let htmlString: string = GadgetGrindConveyor.componentLibrary[Math.floor(Math.random() * GadgetGrindConveyor.componentLibraryLength)].component;
        lastCell.innerHTML = htmlString;

        // delay so we can see them
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Iterate over cell groups and query status and wishlist
        this.conveyorIndex = (this.conveyorIndex + 1) % this.length;
        let cells = this.shadowRoot!.querySelector(`#conveyor`)?.children ?? [];
        
        for (let i = 0; i < this.length; i++) {
            const groupMembers = this.shadowRoot!.querySelectorAll(`.group-${i + 1}`) as NodeList;
            let cellContents = cells[i].firstChild as GadgetGrindAssembly;
            for (let workerCell of groupMembers) {
                let worker = (workerCell.lastChild as GadgetGrindWorker);
                if (cellContents) {
                    // there's an assembly here, check if it's on the wishlist
                    let icon = cellContents.icon as string;
                    if (worker.status === 'ready') {
                        if (worker.wishlist.includes(icon)){
                            this.sendMessage(worker.id, 'pull-request', cellContents);
                            break;
                        }
                    }
                } else {
                    // an empty cell; check to see if there's a completed project
                    if (worker.status === 'complete') {
                        const product = worker.grabProduct();
                        cells[i].appendChild(product);
                        break;
                    }
                }
            }
        }
    }

    handleEvent = (evt: any) => {
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
