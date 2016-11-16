data <- list()
legends <- list()

basepath <- "../../data/v2/adam-decay/";

data[[1]] <- read.csv(file.path(basepath, "0.9-0.999/lda-progress-mongo-0.9-0.999-2130.csv"));
legends[[1]] <- "b1=0.90, b2=0.999";

data[[2]] <- read.csv(file.path(basepath, "0.95-0.999/lda-progress-mongo-0.95-0.999-5087.csv"));
legends[[2]] <- "b1=0.95, b2=0.999";

data[[3]] <- read.csv(file.path(basepath, "0.99-0.999/lda-progress-mongo-0.99-0.999-5311.csv"));
legends[[3]] <- "b1=0.99, b2=0.999";

data[[4]] <- read.csv(file.path(basepath, "0.999-0.999/lda-progress-mongo-0.999-0.999-5092.csv"));
legends[[4]] <- "b1=0.999, b2=0.999";

data[[5]] <- read.csv(file.path(basepath, "0.999-1/lda-progress-mongo-0.999-1-5101.csv"));
legends[[5]] <- "b1=0.999, b2=1";

# data[[6]] <- read.csv(file.path(basepath, "30-threads/lda-progress-mongo-2750.csv"));
# legends[[6]] <- "30 threads";

pdf("../../figures/v2/expt-3-adam-decay.pdf")

plot(data[[1]]$time, data[[1]]$objective, ylim=c(-50000, -39000), type="n", xlab="Runtime (seconds)", ylab="ELBo", main="LDA (30 threads)");

colors <- rainbow(6)

for (i in 1:5){
    lines(data[[i]]$time, data[[i]]$objective, col=colors[i])
}

legend("bottomright", legend=legends, col=colors, lty=1)

dev.off()