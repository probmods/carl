import json
import csv

runtimes = []
elbos = []

filename = "ec2-single-learner-lda"

with open("./data/%s.json" % filename) as data_file:
    data = json.load(data_file)
    for (key, value) in sorted(data.items()):
        runtimes.append(int(key))
        elbos.append(value[0])

min_runtime = min(runtimes)
runtimes = [runtime-min_runtime for runtime in runtimes]

with open('./data/%s.csv' % filename, 'w') as csvfile:
    fieldnames = ['RuntimeInSeconds', 'ELBO']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for (runtime, elbo) in zip(runtimes, elbos):
        writer.writerow({'RuntimeInSeconds': runtime/1000, 'ELBO': elbo})
