# Simple Example

This is a toy application that exercises all parts of Carl. We're modeling the following situation: We're observing tosses from multiple coins (numbered 0..k). We're trying to infer locally the weight of each coin, and globally a hyperparameter theta that correlates the coin weights.

- Perceive:
  - Receive POST data such as `{ coinNumber: 3, outcome: 0 }` or `{ coinNumber: 3, outcome: 1 }` at `127.0.0.1:3001/addPercept`.
  - Add current datetime, then send on to store for collection `percepts`

- Store:
  - Store coin observations in collection `percepts` (each as an individual document)
  - Store current guess about theta in collection `params` (append-only)
  - Store local posteriors (coin weights) in collection 'posteriors' (append-only)

- Learn:
  - Every now and then, update theta based on all observations.

- Infer:
  - When a new coin toss is observed, update our current guess about the weight of the corresponding coin, using stored theta.

- Decide:
  - Whenever a new entry is added to posteriors, compute how many more coin tosses we expect to need before we achieve some target certainty about theta
  - Add entry to `actions` (with `{ enacted: false }`) to print out that target accuracy

- Act:
  - When a new entry is added to `actions`, print out the target accuracy and set `{ enacted: true }`