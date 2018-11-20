# next-tick-repo

The latest @cycle/state release uses `process.nextTick()` for sending state updates. Seems this causes DOM and state events to no longer occur at the same time when using @cycle/time.
