import { GadgetGrindElement } from '../../common/GadgetGrindElement';
import { GadgetGrindEmoji } from '../../../GadgetGrindEmoji';
import type { GadgetGrindMessageDetail } from '../../../GadgetGrindMessenger';
import sharedStyles from '../../common/shared-styles';

/**
 * A factory worker web component that collects components from the conveyor
 * belt and assembles them into finished products.
 *
 * Each worker operates as a three-state machine:
 * - **ready** (🟢) — Waiting to collect components from the belt.
 * - **making** (🟡) — Assembling collected components into a product over
 *   a fixed number of timesteps.
 * - **complete** (🔴) — A finished product is available for pickup.
 *
 * Workers maintain a {@link wishlist} of components they still need and an
 * {@link inventory} of components they have collected. When all recipe
 * components are gathered the worker begins the assembly countdown.
 *
 * @example
 * ```html
 * <gadget-grind-worker id="worker-1"></gadget-grind-worker>
 * ```
 *
 * @extends GadgetGrindElement
 * @element gadget-grind-worker
 */
export class GadgetGrindWorker extends GadgetGrindElement {

    /** Maximum number of components a worker can hold at once. */
    static readonly inventoryMax = 2;

    /** @internal Scoped styles for the worker component. */
    static readonly localStyles = `
        <style>
            #container {
                user-select: none;
                font-size: 36px;
                padding: 5px;
                border-radius: 20px;
                background-color: rgba(255, 255, 255, 0.5);
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 150px;
                min-width: 70px;
                margin: 5px;
            }
            #icon {
                font-size: 36px;
            }
            #inventory, #status {
                display: flex;
                border: none;
                font-size: 24px;
            }
            .status {
                display: none;
                font-size: 14px;
            }
            .status-active {
                display: block;
            }
        </style>
        `;

    /** @internal Shadow DOM markup template. */
    static readonly html = `
        <div id="container">
            <div id="status">
                <span id="ready" class="status status-active">🟢</span>
                <span id="complete" class="status">🔴</span>
                <span id="making" class="status">🟡</span>
            </div>
            <div id="icon"></div>
            <div id="inventory">
            </div>
        </div>
        `;

    /** Reference to the root container inside the Shadow DOM. */
    private container: HTMLElement | null = null;
    /** Reference to the inventory display container inside the Shadow DOM. */
    private inventoryContainer: HTMLElement | null = null;
    /** Random animal emoji representing this worker. */
    private icon: string | null = null;
    /** Current state of the worker: `'ready'`, `'making'`, or `'complete'`. */
    public status: string = 'ready';
    /** Unused weight attribute reserved for future mechanics. */
    private weight: number = 100;
    /** Number of timesteps required to assemble a product. */
    private workTime: number = 4;
    /** Counter tracking elapsed timesteps during assembly. */
    private workCount: number = 0;
    /** Components currently held by this worker. */
    private inventory: HTMLElement[] = [];
    /** Component icons the worker still needs to begin assembly. */
    public wishlist: string[] = [];
    /** Finished products awaiting pickup by the conveyor. */
    public completed: HTMLElement[] = [];
    /** Flavour-text profile for the worker character. */
    private profile = {
        strength: 16,
        dexterity: 16,
        charisma: 10,
        affiliation: 'international workers of the world'
    };
    /**
     * The recipe this worker follows. Defines the required input components,
     * the assembly time, and the HTML string for the output product.
     */
    private recipe = {
        components: [ '🏵', '🍔' ],
        time: 4,
        output: '<gadget-grind-assembly icon="📠"></gadget-grind-assembly>'
    };

    /**
     * Attributes observed by this element: inherited `x`, `y` plus `icon`.
     */
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

    /** Called when the element is inserted into the DOM. */
    connectedCallback() {
        this.setup();
    }

    /** Called when the element is removed from the DOM. */
    disconnectedCallback() {
        this.teardown();
    }

    /** Caches Shadow DOM references and assigns a random animal icon. */
    initialize() {
        this.container = this.shadowRoot!.querySelector('#container');
        this.icon = GadgetGrindEmoji.getRandomAnimalEmoji();
    }

    /**
     * Subscribes to messages, renders the worker icon, attaches event
     * listeners, and initialises the wishlist from the recipe.
     */
    setup = () => {
        this.observedMessages = [`${this.id}`, 'step'];
        this.subscribe(this.observedMessages);
        this.inventoryContainer = this.shadowRoot!.querySelector('#inventory');
        this.shadowRoot!.querySelector('#icon')!.innerHTML = (this.icon as string);
        this.addEventListener(`${this.id}`, this.handleEvent);
        this.addEventListener('step', this.handleStep);
        this.setStatus('ready');
        this.wishlist = this.recipe.components.slice();   // copy array
    }

    /** Cleans up message subscriptions. */
    teardown = () => {
        this.unsubscribe(this.observedMessages);
    }

    /**
     * Advances assembly progress on each simulation timestep.
     * When the work counter reaches {@link workTime}, the product is finished.
     */
    handleStep = () => {
        if (this.status === 'making') {
            this.workCount++;
            if (this.workCount === this.workTime) {
                this.finishProduct();
            }
        }
        this.setWishlist();
    }

    /**
     * Completes assembly: creates the finished product element from the recipe
     * output, moves collected components into it, and transitions to the
     * `complete` state.
     */
    finishProduct() {
        // finished product
        const template = document.createElement('template');
        template.innerHTML = this.recipe.output;
        const product = (template.content.firstElementChild?.cloneNode(true) as HTMLElement);
        this.inventoryContainer!.appendChild(product);
        // Move assemblies to the product
        for (let item of this.inventory) {
            product.appendChild(item);
        }
        this.inventory = [];
        this.completed.push(product);
        this.setStatus('complete');
    }

    /**
     * Handles incoming custom events dispatched via the messenger.
     *
     * Supported commands:
     * - `step` — Delegates to {@link handleStep}.
     * - `pull-request` — Offers a component from the conveyor. If the
     *   component is on the wishlist it is added to inventory; once all
     *   recipe components are collected, assembly begins.
     *
     * @param evt - The incoming {@link CustomEvent} with `detail.cmd` and `detail.content`.
     */
    handleEvent = (evt: Event) => {
        const { cmd, content } = (evt as CustomEvent<GadgetGrindMessageDetail>).detail;

        if (cmd === 'step') {
            this.handleStep();
        }
        if (cmd === 'pull-request') {
            if (this.wishlist.length === 0) return;
            let assembly = content as HTMLElement;
            this.inventory?.push(assembly);
            this.inventoryContainer?.appendChild(assembly);
            this.setWishlist();
            if (this.haveAllAssemblyComponents()) {
                // start making
                this.setStatus('making');
                this.workTime = this.recipe.time;
                this.workCount = 0;
            }
        }
    }

    /**
     * Updates the visual status indicator by toggling CSS classes in the
     * Shadow DOM.
     * @param s - The new status: `'ready'`, `'making'`, or `'complete'`.
     */
    setStatus(s: string) {
        this.shadowRoot!.querySelector(`#${this.status}`)?.classList.toggle('status-active');
        this.status = s;
        this.shadowRoot!.querySelector(`#${this.status}`)?.classList.toggle('status-active');
    }

    /**
     * Reconciles the wishlist against the current inventory, removing
     * components that have already been collected.
     */
    setWishlist() {
        const inventoryIcons: string[] = [];
        for (let item of this.inventory!) {
            inventoryIcons.push((item.getAttribute('icon') as string));
        }
        // Remove items from wishlist that are in the inventory
        const updatedWishlist = this.wishlist?.filter(
            (item) => !inventoryIcons!.includes(item)
        );
        this.wishlist = updatedWishlist;
    }

    /**
     * Checks whether all components required by the recipe have been collected.
     * @returns `true` if the wishlist is empty (all components collected).
     */
    haveAllAssemblyComponents() {
        if (this.wishlist!.length === 0) return true;
        return false;
    }

    /**
     * Removes and returns the most recently completed product, resetting the
     * worker back to the `ready` state so it can begin a new assembly cycle.
     * @returns The finished product element, or `null` if none is available.
     */
    public grabProduct(): HTMLElement {
        this.setStatus('ready');
        this.wishlist = this.recipe.components.slice();
        const returnval = (this.completed.pop() ?? null) as HTMLElement;
        return returnval;
    }

    /**
     * Handles observed attribute changes. Delegates base attributes to the
     * parent and stores the `icon` value locally.
     * @param name - The name of the changed attribute.
     * @param oldValue - The previous attribute value, or `null`.
     * @param newValue - The new attribute value, or `null`.
     */
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
