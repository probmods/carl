data1 <- read.csv("data/lda-stateless-single-step-optimize/1-learner/carl-lda-greedy-instrument-histories.csv");
data7 <- read.csv("data/lda-stateless-single-step-optimize/7-learners/carl-lda-flawless-fall-histories.csv");
pdf("figures/lda-stateless-single-step-optimize/1-vs-7.pdf")
plot(data7, type="l", col="green", ylab="ELBo")
lines(data1, col="red")
legend("bottomright",c("7 learners, lda100, sgd", "1 learner, lda100, sgd"), col=c("green", "red"), lty=1)
dev.off()