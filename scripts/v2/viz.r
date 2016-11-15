data <- list()
legends <- list()

basepath <- "../../data/v2/scaling/expt-2";

data[[1]] <- read.csv(file.path(basepath, "1-thread/lda-progress-mongo-7291.csv"));
legends[[1]] <- "1 thread";

data[[2]] <- read.csv(file.path(basepath, "2-threads/lda-progress-mongo-2757.csv"));
legends[[2]] <- "2 threads";

data[[3]] <- read.csv(file.path(basepath, "4-threads/lda-progress-mongo-2450.csv"));
legends[[3]] <- "4 threads";

data[[4]] <- read.csv(file.path(basepath, "8-threads/lda-progress-mongo-2430.csv"));
legends[[4]] <- "8 threads";

data[[5]] <- read.csv(file.path(basepath, "16-threads/lda-progress-mongo-2536.csv"));
legends[[5]] <- "16 threads";

data[[6]] <- read.csv(file.path(basepath, "30-threads/lda-progress-mongo-2750.csv"));
legends[[6]] <- "30 threads";

pdf("../../figures/v2/expt-2-lda-parallel.pdf")

plot(data[[1]]$time, data[[1]]$objective, ylim=c(-48000, -39000), type="n", xlab="Runtime (seconds)", ylab="ELBo", main="LDA");

colors <- rainbow(6)

for (i in 1:6){
    lines(data[[i]]$time, data[[i]]$objective, col=colors[i])
}

legend("bottomright", legend=legends, col=colors, lty=1)

dev.off()