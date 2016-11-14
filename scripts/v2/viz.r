data <- list()
legends <- list()


data[[1]] <- read.csv("../data/lda-progress-mongo-1.csv");
legends[[1]] <- "MongoDB, single process";

data[[2]] <- read.csv("../data/lda-progress-mongo-2.csv");
legends[[2]] <- "MongoDB, two processes";

pdf("../figures/local-1-vs-2.pdf")

plot(data[[1]]$time, data[[1]]$objective, ylim=c(-49000, -45000), type="n", xlab="Runtime (seconds)", ylab="ELBo", main="LDA");

colors <- rainbow(6)

for (i in 1:2){
    lines(data[[i]]$time, data[[i]]$objective, col=colors[i])
}

legend("bottomright", legend=legends, col=colors, lty=1)

dev.off()