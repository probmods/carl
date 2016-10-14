import json
import csv
import os

dir = "./data/lda-stateless-single-step-optimize/1-learner/"

runtimes = []
elbos = []

filepath = os.path.join(dir, "carl-lda-greedy-instrument-histories")

with open("%s.json" % filepath) as data_file:
    data = json.load(data_file)
    for (key, value) in sorted(data.items()):
        runtimes.append(int(key))
        elbos.append(value[0])

min_runtime = min(runtimes)
runtimes = [runtime-min_runtime for runtime in runtimes]

with open("%s.csv" % filepath, "w") as csvfile:
    fieldnames = ["RuntimeInSeconds", "ELBO"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for (runtime, elbo) in zip(runtimes, elbos):
        writer.writerow({"RuntimeInSeconds": runtime/1000, "ELBO": elbo})
