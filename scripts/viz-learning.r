data <- list()

data[[1]] <- read.csv("data/lda-stateless-single-step-optimize-v2/1-learner/carl-lda-square-harbor-histories.csv");
data[[2]] <- read.csv("data/lda-stateless-single-step-optimize-v2/2-learners/carl-lda-noble-thought-histories.csv");
data[[3]] <- read.csv("data/lda-stateless-single-step-optimize-v2/4-learners/carl-lda-chummy-chess-histories.csv")
data[[4]] <- read.csv("data/lda-stateless-single-step-optimize-v2/8-learners/carl-lda-gaudy-representative-histories.csv");
data[[5]] <- read.csv("data/lda-stateless-single-step-optimize-v2/16-learners/carl-lda-ambiguous-record-histories.csv");
data[[6]] <- read.csv("data/lda-stateless-single-step-optimize-v2/30-learners/carl-lda-aloof-jail-histories.csv");

legends <- list()

legends[[1]] <- "1 learner";
legends[[2]] <- "2 learners";
legends[[3]] <- "4 learners";
legends[[4]] <- "8 learners";
legends[[5]] <- "16 learners";
legends[[6]] <- "30 learners";

pdf("figures/lda-stateless-single-step-optimize-v2/time-vs-elbo.pdf")

plot(data[[1]], xlim=c(0,9000), ylim=c(-48000,-39000), type="n", ylab="ELBo", main="Parallel SGD on LDA100")

colors <- rainbow(6)

for (i in 1:6){
    lines(data[[i]], col=colors[i])
}

legend("bottomright", legend=legends, col=colors, lty=1)

dev.off()