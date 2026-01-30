import { GadgetGrindElement } from '../../common/GadgetGrindElement';
import { GadgetGrindEmoji } from '../../../GadgetGrindEmoji';
import sharedStyles from '../../common/shared-styles';

export class GadgetGrindWorker extends GadgetGrindElement {

    static readonly inventoryMax = 2;

    static readonly localStyles = `
        <style>
            #container {
                user-select: none; 
                font-size: 36px;
                padding: 5px;
                border: 1px dotted red;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 150px;
            }
            #icon {
                font-size: 36px;
            }
            #inventory, #status {
                display: flex;
                border: none;
                font-size: 14px;
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
                <span id="complete" class="status">🔴</span>
                <span id="making" class="status">🟡</span>
            </div>
            <div id="icon"></div>
            <div id="inventory">
            </div>
        </div>
        `;

    private container: HTMLElement | null = null;
    private inventoryContainer: HTMLElement | null = null;
    private icon: string | null = null;
    private status: string = 'ready';
    private weight: number = 100;
    private workTime: number = 4;
    private workCount: number = 0;
    private inventory: HTMLElement[] = [];
    private wishlist: string[] = [];
    private completed: HTMLElement[] = [];
    private profile = {
        strength: 16,
        dexterity: 16,
        charisma: 10,
        affiliation: 'international workers of the world'
    };
    private recipe = {
        components: [ '🏵', '🍔' ],
        time: 4,
        output: '<gadget-grind-assembly icon="📠"></gadget-grind-assembly>'
    };

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
        this.inventoryContainer = this.shadowRoot!.querySelector('#inventory');
        this.shadowRoot!.querySelector('#icon')!.innerHTML = (this.icon as string);
        this.addEventListener(`${this.id}`, this.handleEvent);
        this.setStatus('ready');
        this.wishlist = this.recipe.components.slice();   // copy array
        console.log(this.wishlist);
    }
    
    teardown = () => {
        this.unsubscribe(this.observedMessages);
    }

    handleStep = () => {
        console.log('handle step');
        if (this.status === 'making') {
            this.workCount++;
            console.log(this.workCount);
            if (this.workCount === this.workTime) {
                this.finishProduct();
            }
        }
        this.setWishlist();
    }

    finishProduct() {
        // finished product
        const template = document.createElement('template');
        template.innerHTML = this.recipe.output;
        const product = (template.content.firstElementChild?.cloneNode(true) as HTMLElement);
        this.inventoryContainer!.appendChild(product);
        // Move assemblies to the product
        for (let item of this.inventory) {
            console.log(item);
            product.appendChild(item);
            console.log(product);
        }
        this.inventory = [];
        this.completed.push(product);
        console.log(this.completed);
        this.setStatus('complete');
    }

    handleEvent = (evt: any) => {
        console.log(`${evt.type} ${evt.detail.cmd}`);
        if (evt.detail.cmd === 'step') {
            this.handleStep();
        }
        if (evt.detail.cmd === 'pull-request') {
            console.log('pull-request');
            if (this.wishlist.length === 0) return;
            let assembly = evt.detail.content;
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

    setStatus(s: string) {
        this.shadowRoot!.querySelector(`#${this.status}`)?.classList.toggle('status-active');
        this.status = s;
        this.shadowRoot!.querySelector(`#${this.status}`)?.classList.toggle('status-active');
    }

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

    haveAllAssemblyComponents() {
        if (this.wishlist!.length === 0) return true;
        return false;
    }

    public grabProduct() {
        console.log('grab product');
        this.setStatus('ready');
        this.wishlist = this.recipe.components.slice();
        return this.completed.pop();
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
