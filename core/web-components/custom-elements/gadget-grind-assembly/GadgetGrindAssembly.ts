import { GadgetGrindElement } from '../../common/GadgetGrindElement';
import { GadgetGrindEmoji } from '../../../GadgetGrindEmoji';
import sharedStyles from '../../common/shared-styles';

/**
 * A presentational web component representing a single component or finished
 * product on the conveyor belt.
 *
 * Displays an emoji icon with an optional slot for child component indicators.
 * The icon is set via the `icon` HTML attribute and rendered inside the
 * element's Shadow DOM.
 *
 * @example
 * ```html
 * <gadget-grind-assembly icon="🏵"></gadget-grind-assembly>
 * ```
 *
 * @extends GadgetGrindElement
 * @element gadget-grind-assembly
 */
export class GadgetGrindAssembly extends GadgetGrindElement {

    /** @internal Scoped styles for the assembly component. */
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

    /** @internal Shadow DOM markup template. */
    static readonly html = `
        <div id="container">
            <div id="icon">🧶</div>
            <div id="components">
            <slot></slot>
            </div>
        </div>
        `;

    /** Reference to the root container element inside the Shadow DOM. */
    private container: HTMLElement | null = null;

    /** The emoji string displayed by this assembly. Set via the `icon` attribute. */
    public icon: string | null = null;

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
            + GadgetGrindAssembly.localStyles
            + GadgetGrindAssembly.html;
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

    /** Subscribes to messages and renders the current icon. */
    setup = () => {
        this.observedMessages = [];
        this.subscribe(this.observedMessages);
        this.shadowRoot!.querySelector('#icon')!.innerHTML = (this.icon as string);
    }

    /** Cleans up message subscriptions. */
    teardown = () => {
        this.unsubscribe(this.observedMessages);
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
