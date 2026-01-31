# Gadget Grind

A factory assembly line simulation game built with Web Components, TypeScript, and emoji.

**Repository**: [github.com/fluxly/gadget-grind](https://github.com/fluxly/gadget-grind)

---

## Installation

```bash
# Clone the repository
git clone git@github.com:fluxly/gadget-grind.git
cd gadget-grind

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The development server will open automatically. Navigate to the sandbox files to see the simulation in action:
- `/dist/sandbox/gadget-grind-conveyor-sandbox.html` - Full factory simulation
- `/dist/sandbox/gadget-grind-worker-sandbox.html` - Worker component testing
- `/dist/sandbox/gadget-grind-assembly-sandbox.html` - Assembly component testing

---

## What is Gadget Grind?

Gadget Grind is a factory assembly line simulation where workers must collect components from a moving conveyor belt and assemble them into finished products. The game combines timing, resource management, and spatial coordination challenges.

### The Challenge

Components (represented by emoji icons 🏵 flower and 🍔 burger) appear on a moving conveyor belt at random intervals. Workers stationed along the belt must:

1. **Grab components** as they pass by (only one chance per component)
2. **Collect both required components** (🏵 + 🍔) to start assembly
3. **Wait for assembly to complete** (4 timesteps without touching the belt)
4. **Place the finished product** (📠 fax machine) back on the belt

The simulation tests your ability to coordinate multiple workers, manage limited inventory space, and time actions precisely.

---

## Game Mechanics

### Assembly Recipe

```
🏵 (flower) + 🍔 (burger) → 📠 (fax machine)
Assembly Time: 4 timesteps
```

### Conveyor Belt System

The belt is divided into **fixed-size slots**, each holding exactly one item (component, product, or empty):

```
[🏵] [  ] [🍔] [  ] [🏵] [  ]  ← Belt moves this direction
 ↑    ↑    ↑    ↑    ↑    ↑
 W1   W2   W3   W4   W5   W6   ← Workers on both sides
```

**Belt Rules:**
- Belt moves forward **one slot per timestep**
- New components spawn randomly at the start of the belt
- Components that reach the end move to the parts bin
- Each slot can hold only **one item** at a time

### Worker Constraints

**Inventory Limits:**
- Workers can hold exactly **2 items maximum** (one in each hand)
- Items can be components OR finished products
- Full inventory = cannot grab new components (missed opportunity)

**Action Timing:**
- Workers can perform **one action per timestep**: take OR place (not both)
- **Mutual Exclusion**: Workers on opposite sides of the same slot cannot act simultaneously
  - Only one worker can interact with each belt slot per timestep
  - Prevents conflicts when workers are positioned across from each other

**Assembly State Machine:**

```
┌─────────┐   Got both     ┌─────────┐   4 timesteps   ┌──────────┐
│  READY  │  components    │ MAKING  │    elapsed      │ COMPLETE │
│   🟢    │  (🏵 + 🍔)     │   🟡    │  ───────────>   │   🔴     │
└─────────┘  ───────────>  └─────────┘                 └──────────┘
     ↑                            │                           │
     │                            │                           │
     │                      Cannot touch                  Place product
     │                         belt!                      back on belt
     │                                                         │
     └─────────────────────────────────────────────────────────┘
```

1. **READY** (🟢): Worker can grab components from belt or place products
   - Monitors belt for components matching wishlist
   - Accepts components if inventory not full
   - Wishlist updates dynamically based on what worker already holds

2. **MAKING** (🟡): Worker is assembling the product
   - **Cannot touch the conveyor belt** during assembly
   - Duration: exactly 4 timesteps
   - Work counter increments each timestep
   - Transitions to COMPLETE when counter reaches 4

3. **COMPLETE** (🔴): Product finished, ready to place on belt
   - Worker holds finished 📠 product
   - Must wait for appropriate belt slot to place product
   - Returns to READY after placing product

### Strategic Challenges

**Timing:**
- Components pass by only once - miss them and they're gone
- Must grab components at the right moment
- Must time product placement for the "fourth subsequent slot"

**Resource Management:**
- 2-item inventory limit creates critical decisions
- Holding the wrong items blocks needed components
- Must balance component collection with product output

**Coordination:**
- Multiple workers may need the same components
- Opposite workers create timing conflicts (mutual exclusion)
- Workers busy assembling can't help with component collection

**Failure Scenarios:**
- Component passes while worker has full inventory → MISSED COMPONENT
- Worker starts assembling without both components → STUCK
- All belt slots full → PRODUCTION BOTTLENECK
- No workers available (all busy) → COMPONENTS WASTED

---

## Architecture

### Technology Stack

- **Language**: TypeScript (strict mode)
- **Framework**: Native Web Components API with Shadow DOM
- **Build**: Webpack 5 + ts-loader
- **Module System**: ES2015

### Component Structure

```
core/
├── GadgetGrindEmoji.ts              # Emoji collections and utilities
├── GadgetGrindMessenger.ts          # Pub/Sub messaging system
└── web-components/
    ├── common/
    │   ├── GadgetGrindElement.ts    # Base class for all components
    │   └── shared-styles.ts         # Common CSS
    └── custom-elements/
        ├── gadget-grind-assembly/   # Assembly/component items
        ├── gadget-grind-worker/     # Worker state machine
        └── gadget-grind-conveyor/   # Conveyor belt coordinator
```

### Web Components

#### 1. `<gadget-grind-assembly>`

Represents a component or finished product on the belt.

**Attributes:**
- `icon` - Emoji representing the item (🏵, 🍔, 📠, etc.)

**Example:**
```html
<gadget-grind-assembly icon="🏵"></gadget-grind-assembly>
<gadget-grind-assembly icon="📠"></gadget-grind-assembly>
```

#### 2. `<gadget-grind-worker>`

A factory worker that collects components and assembles products.

**Key Properties:**
- `status` - Current state: `'ready'`, `'making'`, or `'complete'`
- `inventory` - Array of held items (max 2)
- `wishlist` - Array of needed component icons
- `completed` - Array of finished products ready to place

**Key Methods:**
- `grabProduct()` - Remove and return completed product
- `handleStep()` - Process one simulation timestep
- `handleEvent(evt)` - Respond to messages (`step`, `pull-request`)

**Example:**
```html
<gadget-grind-worker icon="🐼"></gadget-grind-worker>
```

**JavaScript API:**
```javascript
const worker = document.querySelector('gadget-grind-worker');

// Check status
console.log(worker.status); // 'ready', 'making', or 'complete'

// Check what worker needs
console.log(worker.wishlist); // ['🏵', '🍔'] or ['🍔'] etc.

// Grab completed product
if (worker.status === 'complete') {
  const product = worker.grabProduct(); // Returns <gadget-grind-assembly icon="📠">
}
```

#### 3. `<gadget-grind-conveyor>`

The conveyor belt that coordinates the entire simulation.

**Attributes:**
- `length` - Number of conveyor positions (default: 6)

**Key Methods:**
- `handleStep()` - Advance simulation one timestep (async)

**Layout:**
- Conveyor cells (slots for items)
- Worker stations (positioned on both sides)
- Parts bin (accumulates completed products)
- Count display (shows production statistics)

**Example:**
```html
<gadget-grind-conveyor length="6"></gadget-grind-conveyor>
```

**JavaScript API:**
```javascript
const conveyor = document.querySelector('gadget-grind-conveyor');

// Advance simulation one timestep
await conveyor.handleStep();

// Access parts bin
const partsBin = conveyor.shadowRoot.querySelector('.parts-bin');
console.log('Completed products:', partsBin.children.length);
```

### Messaging System

All components communicate via a **Pub/Sub event system** using `GadgetGrindMessenger`.

**Message Format:**
```javascript
{
  cmd: string,      // Command type ('step', 'pull-request')
  content: unknown  // Message payload
}
```

**Common Messages:**
- `'step'` - Global timestep signal (broadcast to all components)
- `'{workerId}'` - Targeted message to specific worker
- `'pull-request'` - Conveyor offers component to worker

**Example:**
```javascript
// Broadcast timestep to all components
GadgetGrindMessenger.sendMessage('step', 'step', {});

// Offer component to specific worker
const worker = document.querySelector('gadget-grind-worker');
const flower = document.createElement('gadget-grind-assembly');
flower.setAttribute('icon', '🏵');
GadgetGrindMessenger.sendMessage(worker.id, 'pull-request', flower);
```

### Base Class: `GadgetGrindElement`

All components extend this base class, which provides:
- Shadow DOM setup
- Message subscription/broadcasting
- Attribute observation
- Common styling

**Key Methods:**
- `sendMessage(msg, cmd, content)` - Send targeted message
- `broadcastMessage(msg, cmd, content)` - Broadcast to all subscribers
- `subscribe(msgList)` - Subscribe to message types
- `unsubscribe(msgList)` - Unsubscribe from messages

---

## Development

### Project Scripts

```bash
npm start       # Start webpack dev server with hot reload
npm run build   # Build for production (outputs to dist/)
```

### Sandbox Environments

Interactive playgrounds for testing components:

1. **Assembly Sandbox** (`sandbox/gadget-grind-assembly-sandbox.html`)
   - Test assembly components with different icons
   - Send custom messages
   - Verify icon property and rendering

2. **Worker Sandbox** (`sandbox/gadget-grind-worker-sandbox.html`)
   - Test worker state machine
   - Manually send components to workers
   - Control timesteps and observe state transitions
   - Grab completed products
   - Interactive controls: Step, Pull Request, Grab Product

3. **Conveyor Sandbox** (`sandbox/gadget-grind-conveyor-sandbox.html`)
   - Full factory simulation
   - Multiple workers coordinating
   - Automatic timestep progression
   - Watch complete assembly cycles

### Build Configuration

**Webpack** (`webpack.config.js`):
- Entry: `./index.ts`
- Output: `dist/bundle.js`
- TypeScript loader (ts-loader)
- Copy plugin for static assets (HTML, images, styles, sandboxes)

**TypeScript** (`tsconfig.json`):
- Target: ES2015
- Strict mode enabled
- Declaration files generated

---

## Code Examples

### Creating a Custom Simulation

```javascript
// Create conveyor with custom length
const conveyor = document.createElement('gadget-grind-conveyor');
conveyor.setAttribute('length', '8'); // 8 worker positions
document.body.appendChild(conveyor);

// Access the global messenger
const messenger = window.GadgetGrindMessenger;

// Run simulation loop
setInterval(() => {
  messenger.sendMessage('step', 'step', {});
}, 1000); // 1 timestep per second
```

### Monitoring Worker Status

```javascript
const workers = document.querySelectorAll('gadget-grind-worker');

workers.forEach(worker => {
  console.log(`Worker ${worker.id}:`, {
    status: worker.status,
    inventory: worker.inventory.length,
    wishlist: worker.wishlist,
    completed: worker.completed.length
  });
});
```

### Tracking Production

```javascript
const conveyor = document.querySelector('gadget-grind-conveyor');
const partsBin = conveyor.shadowRoot.querySelector('.parts-bin');

// Count completed products by type
const products = Array.from(partsBin.children);
const productCounts = products.reduce((counts, product) => {
  const icon = product.getAttribute('icon');
  counts[icon] = (counts[icon] || 0) + 1;
  return counts;
}, {});

console.log('Production statistics:', productCounts);
// Example output: { '📠': 5 }
```

---

## Emoji Utilities

The `GadgetGrindEmoji` module provides collections of emoji for various purposes:

**Collections:**
- `animals` - 100+ animal emoji (used for worker icons)
- `roundSelection` - Round objects and shapes
- `roundColors` - 9 circle color emoji
- `squareColors` - 9 square color emoji
- `devices` - Computer and tech emoji
- `buildings` - Building emoji
- `emojis` - 1000+ general emoji collection

**Methods:**
- `getRandomEmoji()` - Random emoji from general collection
- `getRandomAnimalEmoji()` - Random animal emoji (default for workers)
- `getRandomRoundEmoji()` - Random round shape
- `getRandomRoundColor()` - Random colored circle
- `getRandomSquareColor()` - Random colored square

---

## Current Limitations

### Hardcoded Recipe
- All workers use the same recipe: 🏵 + 🍔 → 📠
- Assembly time is fixed at 4 timesteps
- No support for multiple recipes or dynamic assignment

### Simulation Features
- Component spawn rate is fixed (no difficulty scaling)
- No player input controls (fully automated simulation)
- No win/lose conditions or scoring system
- No pause/resume or speed control
- No visualization of worker states (status indicators)

### Missing Game Features
- No component queue or preview system
- No tutorial or help system
- No difficulty progression
- No performance metrics or analytics

### Known Bugs
- `GadgetGrindEmoji.getRandomAnimalEmoji()` uses wrong array length (line 66)
- No validation on conveyor length attribute
- No error handling in message system
- No accessibility (ARIA) attributes

---

## Testing

**Current Status**: Test directories exist but are empty. No test framework is currently installed.

**Test Directories:**
- `core/web-components/custom-elements/gadget-grind-assembly/tests/`
- `core/web-components/custom-elements/gadget-grind-worker/tests/`
- `core/web-components/custom-elements/gadget-grind-conveyor/tests/`

**Recommended Test Frameworks:**
- [@web/test-runner](https://modern-web.dev/docs/test-runner/overview/) - Optimized for Web Components
- [Jest](https://jestjs.io/) - With jsdom for DOM testing

**Key Testing Scenarios:**
- Worker state machine transitions
- Inventory constraints (2-item max)
- Assembly timing (4 timesteps)
- Wishlist matching and component grabbing
- Message passing and coordination
- Full assembly cycle integration tests
- Edge cases (full inventory, belt congestion, etc.)

---

## Architecture Patterns

1. **Web Components API** - All components extend `HTMLElement`
2. **Shadow DOM Encapsulation** - Scoped styling and templates
3. **Pub/Sub Messaging** - Custom event system for component communication
4. **State Machine Pattern** - Worker uses status states (ready/making/complete)
5. **Factory Pattern** - Conveyor orchestrates worker-assembly interactions
6. **Template-based Rendering** - HTML templates cloned into shadow roots
7. **Attribute Observation** - `observedAttributes` for reactive data binding

---

## Contributing

Contributions are welcome! Areas for improvement:

- **Testing**: Set up test framework and write comprehensive tests
- **Multiple Recipes**: Support for different assembly recipes and difficulty levels
- **UI Enhancements**: Visual indicators for worker status, component preview
- **Player Controls**: Pause/resume, speed control, manual worker assignment
- **Scoring System**: Track efficiency, throughput, missed components
- **Accessibility**: Add ARIA attributes and keyboard navigation
- **Documentation**: JSDoc comments for all public APIs
- **Bug Fixes**: Fix known bugs (emoji utility, validation, error handling)

---

## License

See LICENSE.md

---

## Credits

Built with TypeScript, Web Components, and emoji by [Fluxly](https://github.com/fluxly).

**Repository**: [github.com/fluxly/gadget-grind](https://github.com/fluxly/gadget-grind)
