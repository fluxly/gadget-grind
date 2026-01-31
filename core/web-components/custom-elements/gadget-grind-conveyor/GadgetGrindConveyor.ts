import { GadgetGrindElement } from '../../common/GadgetGrindElement';
import type { GadgetGrindWorker } from '../gadget-grind-worker/GadgetGrindWorker';
import type { GadgetGrindAssembly } from '../gadget-grind-assembly/GadgetGrindAssembly';
import type { GadgetGrindMessageDetail } from '../../../GadgetGrindMessenger';
import { GadgetGrindEmoji } from '../../../GadgetGrindEmoji';
import sharedStyles from '../../common/shared-styles';

/**
 * The top-level orchestrator web component for the Gadget Grind factory
 * simulation.
 *
 * Manages a moving conveyor belt of configurable length, coordinates two rows
 * of workers (top and bottom), and collects finished products into a parts bin.
 * On each `step` message the conveyor:
 *
 * 1. Rotates the belt — the last cell wraps to the front and receives a
 *    randomly selected component (or remains empty).
 * 2. Iterates over worker groups paired to each belt cell. Ready workers
 *    whose wishlists match the cell's component receive a `pull-request`.
 *    Workers with a completed product place it onto an empty cell.
 * 3. Updates the parts-bin tally via a {@link MutationObserver}.
 *
 * Workers are slotted into the element as light-DOM children and redistributed
 * into Shadow DOM worker cells on setup.
 *
 * @example
 * ```html
 * <gadget-grind-conveyor id="conveyor" length="3">
 *   <gadget-grind-worker id="w1"></gadget-grind-worker>
 *   <gadget-grind-worker id="w2"></gadget-grind-worker>
 *   <gadget-grind-worker id="w3"></gadget-grind-worker>
 *   <gadget-grind-worker id="w4"></gadget-grind-worker>
 *   <gadget-grind-worker id="w5"></gadget-grind-worker>
 *   <gadget-grind-worker id="w6"></gadget-grind-worker>
 * </gadget-grind-conveyor>
 * ```
 *
 * @extends GadgetGrindElement
 * @element gadget-grind-conveyor
 */
export class GadgetGrindConveyor extends GadgetGrindElement {

    /** Upper bound for the configurable belt length. */
    static readonly maxLength = 10;
    /** Milliseconds to pause between conveyor movement and worker processing. */
    static readonly delay = 100;  // msec
    /** Number of entries in the component library (including the empty slot). */
    static readonly componentLibraryLength = 3;
    /**
     * Weighted list of components that can spawn on the belt each step.
     * Each entry defines an HTML string and a weight for random selection.
     */
    static componentLibrary = [
        { component : '<gadget-grind-assembly icon="🏵"></gadget-grind-assembly>', weight: 1 },
        { component : '<gadget-grind-assembly icon="🍔"></gadget-grind-assembly>', weight: 1 },
        { component : '', weight: 1 }
    ]
    /** @internal Scoped styles for the conveyor component. */
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
            #parts-bin-count {
                width: 80%;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
        </style>
        `;
  
    /** @internal Shadow DOM markup template. */
    static readonly html = `
    <div id="container-wrapper">
        <div id="container">
            <div id="worker-row-top" class="worker-row">
                <div id="worker-cell-1" class="worker-cell group-1"></div>
                <div id="worker-cell-2" class="worker-cell group-2"></div>
                <div id="worker-cell-3" class="worker-cell group-3"></div>
            </div>
            <div id="conveyor">
                <div id="cell-1" style="background-color: #000000;" class="conveyor-cell"></div>
                <div id="cell-2" style="background-color: #444444;" class="conveyor-cell"></div>
                <div id="cell-3" style="background-color: #888888;" class="conveyor-cell"></div>
            </div>
            <div id="worker-row-bottom" class="worker-row">
                <div id="worker-cell-4" class="worker-cell group-1"></div>
                <div id="worker-cell-5" class="worker-cell group-2"></div>
                <div id="worker-cell-6" class="worker-cell group-3"></div>
            </div>
        </div>
        <div id="parts-bin-wrapper">
            <div id="parts-bin"></div>
            <div id="parts-bin-count"></div>
        </div>
        <slot></slot>
    </div>
        `;

    /** Reference to the root container inside the Shadow DOM. */
    private container: HTMLElement | null = null;
    /** Number of cells on the conveyor belt (set via the `length` attribute). */
    private length: number = 6;
    /** Current rotation index used to track belt position. */
    private conveyorIndex: number = 0;
    /** Groups of worker elements mapped to conveyor cell positions. */
    private workerGroups: HTMLElement[][] | null = [];
    /** Observer that triggers a parts-bin tally when products are deposited. */
    private partsObserver?: MutationObserver;

    /**
     * Attributes observed by this element: inherited `x`, `y` plus `length`.
     */
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
  
    /** Called when the element is inserted into the DOM. */
    connectedCallback() {
        this.setup();
    }

    /** Called when the element is removed from the DOM. */
    disconnectedCallback() {
        this.teardown();
    }

    /** Caches Shadow DOM element references. */
    initialize() {
        this.container = this.shadowRoot!.querySelector('#container');
    }

    /**
     * Subscribes to messages, attaches event listeners, sets up the
     * {@link MutationObserver} on the parts bin, and distributes slotted
     * worker elements into their respective Shadow DOM cells.
     */
    setup = () => {
        this.observedMessages = [`${this.id}`, 'step'];
        this.subscribe(this.observedMessages); 
        this.addEventListener(`${this.id}`, this.handleEvent);
        this.addEventListener('step', this.handleStep);
        
        this.partsObserver = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    this.tallyPartsBin();
                }
            }
        });

        this.partsObserver.observe(
            this.shadowRoot!.querySelector('#parts-bin') as HTMLElement, {
                childList: true
            }
        );

        const slot = this.shadowRoot!.querySelector('slot');
        const workers = slot?.assignedElements() ?? [];
        let count = 0;
        for (let worker of workers) {
            count++;
            this.shadowRoot!.querySelector(`#worker-cell-${count}`)?.appendChild(worker);
        }
    }
    
    /** Cleans up message subscriptions. */
    teardown = () => {
        this.unsubscribe(this.observedMessages);
    }

    /**
     * Executes a single simulation timestep:
     * 1. Rotates the conveyor belt and spawns a random component.
     * 2. Pauses briefly for visual effect.
     * 3. Iterates over worker groups — offers components to ready workers
     *    and places finished products onto empty cells.
     */
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
        await new Promise(resolve => setTimeout(resolve, GadgetGrindConveyor.delay));

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

    /**
     * Handles incoming custom events dispatched via the messenger.
     * Delegates `step` commands to {@link handleStep}.
     * @param evt - The incoming {@link CustomEvent}.
     */
    handleEvent = (evt: Event) => {
        const { cmd, content } = (evt as CustomEvent<GadgetGrindMessageDetail>).detail;
        
        if (cmd === 'step') {
            this.handleStep();
        }
    }

    /**
     * Counts the items in the parts bin by icon and updates the tally display.
     */
    tallyPartsBin() {
        const partsBin = this.shadowRoot!.querySelector('#parts-bin');
        const tallyContainer = this.shadowRoot!.querySelector('#parts-bin-count');
        let tallyDisplay = `<span>🏵: 0</span><span>🍔: 0</span>`;
        const counts: Record<string, number> = Object.create(null);

        const n = partsBin?.children?.length ?? 0;

        for (let i = 0; i < n; i++) {
            const icon = (partsBin?.children[i] as Element).getAttribute('icon');
            if (!icon) continue;

            counts[icon] = (counts[icon] || 0) + 1;
        }
        tallyContainer!.innerHTML = JSON.stringify(counts);
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
