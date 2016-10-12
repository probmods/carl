data <- read.csv("data/ec2-single-learner-lda.csv");
pdf("ec2-single-learner-lda.pdf")
plot(data, type="l")
dev.off()