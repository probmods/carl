Architecture:

- *act*: schedule notifications for new questions
- *decide*: choose what question to ask next
- *infer*: update local per-person posteriors, maybe using particle filtering
- *learn*: update global (population) parameters using variational inference
- *perceive*: receive new data from users
- *store*: database, stores users, questions, answers, local posteriors, global parameters
