Requirements:

- Node version 4
- MongoDB

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

Database collections:

- *actions*: a record of questions we have decided to enact (updated by *decide* and *act*)
  - `questionType` - dependent measure, e.g. `text`, `likert` or `discrete`
  - `questionData` - for `discrete`, a set of choices
  - `datetime` - when do we schedule the question (pacific time)?
  - `user` - who is the question for; id in `users` collection
  - `enacted` - boolean; true once notification is submitted to sendgrid
- *parameters*: the current state of the global model, updated by *learn*
  - `params` - object containing current parameters
- *posteriors*: local posteriors, one
  - `user` - id in `users` collection
  - `posterior` - some representation of posterior, maybe particles
- *percepts*: all the (answer) data we got from users
  - `questionID` - id in action collection
  - `answer` - object with structure depending on question type
- *users*
  - `name`