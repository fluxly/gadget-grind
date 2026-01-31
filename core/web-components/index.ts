import { GadgetGrindMessenger } from '../GadgetGrindMessenger';

// Expose messenger for sandbox scripts
(window as any).GadgetGrindMessenger = GadgetGrindMessenger;

import './custom-elements/gadget-grind-assembly/gadget-grind-assembly.ts';
import './custom-elements/gadget-grind-worker/gadget-grind-worker.ts';
import './custom-elements/gadget-grind-conveyor/gadget-grind-conveyor.ts';