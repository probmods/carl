import json
import csv
import os

# Recursively walk directory, converting all json files

dir = "./data/lda-stateless-single-step-optimize-v2/"

def convert(filepath):
    runtimes = []
    elbos = []
    with open(filepath) as data_file:
        data = json.load(data_file)["histories"]
        for (key, value) in sorted(data.items()):
            runtimes.append(int(key))
            elbos.append(value[0])
    
    min_runtime = min(runtimes)
    runtimes = [runtime-min_runtime for runtime in runtimes]
    
    with open("%s.csv" % filepath[:-5], "w") as csvfile:
        fieldnames = ["RuntimeInSeconds", "ELBO"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
        writer.writeheader()
        for (runtime, elbo) in zip(runtimes, elbos):
            writer.writerow({"RuntimeInSeconds": runtime/1000, "ELBO": elbo})

def main():
    for root, dirs, files in os.walk(dir):
        for file in files:
            if file.endswith(".json"):
                filepath = os.path.join(root, file)                
                try:
                    convert(filepath)
                except ValueError:
                    print "ERROR",
                else:
                    print "OK",
                print filepath                    
            
main()                
