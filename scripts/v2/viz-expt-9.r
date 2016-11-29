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

data[[1]] <- read.csv(file.path(basepath, "s0.001-mu+0.0-threads1/lda-progress-mongo-s0.001-mu0.0-7077.csv"));
legends[[1]] <- "1 thread";

data[[2]] <- read.csv(file.path(basepath, "s0.001-mu+0.0-threads2/lda-progress-mongo-s0.001-mu0.0-6154.csv"));
legends[[2]] <- "2 threads";

data[[3]] <- read.csv(file.path(basepath, "s0.001-mu+0.0-threads4/lda-progress-mongo-s0.001-mu0.0-6584.csv"));
legends[[3]] <- "4 threads";

data[[4]] <- read.csv(file.path(basepath, "s0.001-mu+0.0-threads8/lda-progress-mongo-s0.001-mu0.0-6242.csv"));
legends[[4]] <- "8 threads";

data[[5]] <- read.csv(file.path(basepath, "s0.001-mu+0.0-threads16/lda-progress-mongo-s0.001-mu0-5769.csv"));
legends[[5]] <- "16 threads";

data[[6]] <- read.csv(file.path(basepath, "s0.001-mu+0.0-threads30/lda-progress-mongo-s0.001-mu0-5327.csv"));
legends[[6]] <- "30 threads";

pdf("../../figures/v2/expt-9-var-threads-denoise.pdf")

plot(data[[1]]$time, data[[1]]$objective, ylim=c(-48000, -39000), type="n", xlab="Runtime (seconds)", ylab="ELBo", main="LDA (SGD, step size 0.001, no momentum)");

colors <- rainbow(6)

for (i in 1:6){
    lines(data[[i]]$time, denoise(data[[i]]$objective), col=colors[i])
}

legend("bottomright", legend=legends, col=colors, lty=1)

dev.off()