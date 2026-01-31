# Gadget Grind Claude Skill

This directory contains a custom Claude Skill for the Gadget Grind codebase.

## Available Skills

### gadget-test-doc

Expert assistant for writing tests and documentation for the Gadget Grind Web Components framework.

**Usage:**
```bash
/gadget-test-doc
```

## What This Skill Knows

The `gadget-test-doc` skill has comprehensive knowledge of:

- **Game/Simulation Mechanics**: Complete understanding of how Gadget Grind works as a factory simulation
  - Assembly recipe: 🏵 + 🍔 → 📠
  - Belt movement (slot-based, one position per timestep)
  - Worker constraints (2-item inventory, 4-timestep assembly, can't touch belt while making)
  - Mutual exclusion rules (opposite workers can't touch same slot)
  - State machine (ready → making → complete)
  - Strategic challenges and failure scenarios

- **Project Structure**: All components, utilities, and build configuration
- **Component Architecture**: GadgetGrindAssembly, GadgetGrindWorker, GadgetGrindConveyor
- **Messaging System**: Pub/Sub event system with GadgetGrindMessenger
- **Emoji Utilities**: Random emoji generation and collections
- **Base Classes**: GadgetGrindElement and common patterns
- **Build System**: Webpack configuration and TypeScript setup
- **Architectural Patterns**: Web Components, Shadow DOM, State Machines

## What This Skill Can Help With

### Writing Tests
- Recommend test frameworks (@web/test-runner or Jest)
- Generate unit tests for individual components
- Create integration tests for message passing
- **Test simulation mechanics**:
  - Worker state machine (ready → making → complete)
  - Inventory constraints (2-item max, rejection when full)
  - Assembly timing (4 timesteps)
  - Wishlist matching and component grabbing
  - Mutual exclusion rules
- **Test game scenarios**:
  - Full assembly cycle (component spawn → grab → assemble → place → parts bin)
  - Edge cases (full inventory, belt congestion, missing components)
  - Worker coordination and competition
- Test Shadow DOM and template rendering
- Mock async behaviors and message events

### Writing Documentation
- Generate JSDoc comments for classes and methods with simulation context
- **Document game mechanics**:
  - How the factory simulation works
  - Assembly recipe and timing
  - Worker constraints and strategies
  - Belt movement and slot system
- Document component attributes and events
- Create usage examples showing complete assembly cycles
- Update README.md with:
  - Game overview and how to play
  - Simulation rules and constraints
  - Component catalog
  - Visual diagrams (ASCII art for belt layout)
- Document messaging protocols
- Explain architectural patterns

## Example Commands

After activating the skill with `/gadget-test-doc`, you can ask:

**For Tests:**
- "Write unit tests for GadgetGrindWorker state machine"
- "Test the 2-item inventory constraint"
- "Create tests for the full assembly cycle (🏵 + 🍔 → 📠)"
- "Test that workers can't grab from belt while status is 'making'"
- "Write integration tests for conveyor-worker coordination"
- "Test edge case: worker with full inventory misses needed component"
- "Help me set up @web/test-runner for this project"
- "Create tests that verify the 4-timestep assembly timing"

**For Documentation:**
- "Add JSDoc comments to GadgetGrindWorker explaining the game mechanics"
- "Document the assembly state machine with simulation context"
- "Create a comprehensive README explaining how the factory simulation works"
- "Document the wishlist property and how it relates to component grabbing"
- "Add usage examples showing a complete assembly cycle"
- "Document the mutual exclusion rule for opposite workers"
- "Explain the inventory constraints in the grabProduct method docs"
- "Write a game overview section for the README"

## Skill Configuration

The skill is defined in `.claude/skills.yaml` and includes:
- Complete codebase architecture overview
- Test writing guidelines and patterns
- Documentation standards (JSDoc format)
- Known issues and bugs
- File locations and structure
- Architectural patterns to reference

## Notes

- **Understands the simulation**: The skill knows this is a factory puzzle game, not just generic web components
- **Knows game mechanics**: Assembly recipe (🏵 + 🍔 → 📠), worker constraints, belt movement, timing rules
- **Aware of simulation rules**: 2-item inventory max, 4-timestep assembly, mutual exclusion, state machine
- **Empty test directories**: Knows test directories exist but need to be filled
- **Hardcoded recipe**: Aware that GadgetGrindWorker has recipe hardcoded (should document this limitation)
- **Known bugs**: Knows about the bug in `getRandomAnimalEmoji()` at line 66
- **Shadow DOM patterns**: Understands the Web Components architecture
- **Can recommend test frameworks**: Since none are currently installed (@web/test-runner or Jest)
