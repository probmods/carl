shift <- function(x, n, invert=FALSE, default=NA){
  stopifnot(length(x)>=n)
  if(n==0){
    return(x)
  }
  n <- ifelse(invert, n*(-1), n)
  if(n<0){
    n <- abs(n)
    forward=FALSE
  }else{
    forward=TRUE
  }
  if(forward){
    return(c(rep(default, n), x[seq_len(length(x)-n)]))
  }
  if(!forward){
    return(c(x[seq_len(length(x)-n)+n], rep(default, n)))
  }
}

denoise_step <- function(x){
  return(pmax(x, shift(x, 1), na.rm = TRUE))
}

denoise <- function(x){
  return(denoise_step(denoise_step(denoise_step(x))))
}


data <- list()
legends <- list()

basepath <- "../../data/v2/sgd2/";

data[[1]] <- read.csv(file.path(basepath, "s0.001-mu+0.3-threads08/lda-progress-mongo-s0.001-mu0.3-5792.csv"));
legends[[1]] <- "8 threads, momentum=0.3";

data[[2]] <- read.csv(file.path(basepath, "s0.001-mu+0.6-threads08/lda-progress-mongo-s0.001-mu0.6-6716.csv"));
legends[[2]] <- "8 threads, momentum=0.6";

data[[3]] <- read.csv(file.path(basepath, "s0.001-mu+0.3-threads16/lda-progress-mongo-s0.001-mu0.3-5764.csv"));
legends[[3]] <- "16 threads, momentum=0.3";

data[[4]] <- read.csv(file.path(basepath, "s0.001-mu+0.6-threads16/lda-progress-mongo-s0.001-mu0.6-6099.csv"));
legends[[4]] <- "16 threads, momentum=0.6";

# data[[5]] <- read.csv(file.path(basepath, "0.999-1/lda-progress-mongo-0.999-1-5101.csv"));
# legends[[5]] <- "b1=0.999, b2=1";

# data[[6]] <- read.csv(file.path(basepath, "30-threads/lda-progress-mongo-2750.csv"));
# legends[[6]] <- "30 threads";

pdf("../../figures/v2/expt-5-8vs16-threads-momentum.pdf")

plot(data[[1]]$time, data[[1]]$objective, ylim=c(-48000, -39000), type="n", xlab="Runtime (seconds)", ylab="ELBo", main="LDA (SGD, step size 0.001)");

colors <- rainbow(6)

for (i in 1:4){
    lines(data[[i]]$time, data[[i]]$objective, col=colors[i])
}

legend("bottomright", legend=legends, col=colors, lty=1)

dev.off()