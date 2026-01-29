import  { GadgetGrindMessenger }  from '../../GadgetGrindMessenger';

export class GadgetGrindElement extends HTMLElement {
	static baseStyles = ``;
    static baseHtml = ``;

    private x: number = 0;
	private y: number = 0;

	public observedMessages: string[] = [];
	static get baseObservedAttributes() { 
        return [ 'x', 'y' ];
    }

	constructor() {
		super();
	}
	
	sendMessage(msg: string, cmd: string, content: unknown) {
        GadgetGrindMessenger.sendMessage(msg, cmd, content);
	}

	broadcastMessage(msg: string, cmd: string, content: unknown) {
        let evt = new CustomEvent(msg, { detail: { cmd: cmd, content: content }});
        window.dispatchEvent(evt);
	}

	subscribe(msgList: string[]) {
        for (let msg of msgList) {
            GadgetGrindMessenger.subscribe(msg, this);
		}
	}
	
	unsubscribe(msgList: string[]) {
	    for (let msg of msgList) {
			GadgetGrindMessenger.unsubscribe(msg, this);
		}
	}

	attributeChangedCallback(
		name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        if (name === 'x') {
            this.x = Number(newValue);
        }
        if (name === 'y') {
            this.y = Number(newValue);
        }
	}
} 