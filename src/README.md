Architecture:

- *act*: schedule notifications for new questions
  - `127.0.0.1:3001`
- *decide*: choose what question to ask next
  - `127.0.0.1:3002`
- *infer*: update local per-person posteriors, maybe using particle filtering
  - `127.0.0.1:3003`
- *learn*: update global (population) parameters using variational inference
  - `127.0.0.1:3004`
- *perceive*: receive new data from users
  - `127.0.0.1:3005`
- *store*: database, stores users, questions, answers, local posteriors, global parameters
  - `127.0.0.1:4000`
