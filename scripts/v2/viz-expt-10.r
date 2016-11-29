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

basepath <- "../../data/v2/";

data[[1]] <- read.csv(file.path(basepath, "scaling/expt-2/1-thread/lda-progress-mongo-7291.csv"));
legends[[1]] <- "1 thread, adam";

data[[2]] <- read.csv(file.path(basepath, "scaling/expt-2/2-threads/lda-progress-mongo-2757.csv"));
legends[[2]] <- "2 threads, adam";

data[[3]] <- read.csv(file.path(basepath, "scaling/expt-2/4-threads/lda-progress-mongo-2450.csv"));
legends[[3]] <- "4 threads, adam";

data[[4]] <- read.csv(file.path(basepath, "scaling/expt-2/8-threads/lda-progress-mongo-2430.csv"));
legends[[4]] <- "8 threads, adam";

# data[[5]] <- read.csv(file.path(basepath, "scaling/expt-2/16-threads/lda-progress-mongo-2536.csv"));
# legends[[5]] <- "16 threads, adam";
# 
# data[[6]] <- read.csv(file.path(basepath, "scaling/expt-2/30-threads/lda-progress-mongo-2750.csv"));
# legends[[6]] <- "30 threads, adam";

data[[5]] <- read.csv(file.path(basepath, "sgd2/s0.001-mu+0.0-threads1/lda-progress-mongo-s0.001-mu0.0-7077.csv"));
legends[[5]] <- "1 thread, sgd, no momentum";

data[[6]] <- read.csv(file.path(basepath, "sgd2/s0.001-mu+0.0-threads2/lda-progress-mongo-s0.001-mu0.0-6154.csv"));
legends[[6]] <- "2 threads, sgd, no momentum";

data[[7]] <- read.csv(file.path(basepath, "sgd2/s0.001-mu+0.0-threads4/lda-progress-mongo-s0.001-mu0.0-6584.csv"));
legends[[7]] <- "4 threads, sgd, no momentum";

data[[8]] <- read.csv(file.path(basepath, "sgd2/s0.001-mu+0.0-threads8/lda-progress-mongo-s0.001-mu0.0-6242.csv"));
legends[[8]] <- "8 threads, sgd, no momentum";

data[[9]] <- read.csv(file.path(basepath, "sgd2/s0.001-mu+0.0-threads16/lda-progress-mongo-s0.001-mu0-5769.csv"));
legends[[9]] <- "16 threads, sgd, no momentum";

data[[10]] <- read.csv(file.path(basepath, "sgd2/s0.001-mu+0.0-threads30/lda-progress-mongo-s0.001-mu0-5327.csv"));
legends[[10]] <- "30 threads, sgd, no momentum";


data[[11]] <- read.csv(file.path(basepath, "sgd2/s0.001-mu+0.3-threads08/lda-progress-mongo-s0.001-mu0.3-5792.csv"));
legends[[11]] <- "8 threads, sgd, momentum=0.3";

data[[12]] <- read.csv(file.path(basepath, "sgd2/s0.001-mu+0.3-threads16/lda-progress-mongo-s0.001-mu0.3-5764.csv"));
legends[[12]] <- "16 threads, sgd, momentum=0.3";

data[[13]] <- read.csv(file.path(basepath, "sgd2/s0.001-mu+0.3-threads30/lda-progress-mongo-s0.001-mu0.3-5314.csv"));
legends[[13]] <- "30 threads, sgd, momentum=0.3";


data[[14]] <- read.csv(file.path(basepath, "sgd2/s0.001-mu+0.6-threads08/lda-progress-mongo-s0.001-mu0.6-6716.csv"));
legends[[14]] <- "8 threads, sgd, momentum=0.6";

data[[15]] <- read.csv(file.path(basepath, "sgd2/s0.001-mu+0.6-threads16/lda-progress-mongo-s0.001-mu0.6-6099.csv"));
legends[[15]] <- "16 threads, sgd, momentum=0.6";

data[[16]] <- read.csv(file.path(basepath, "sgd2/s0.001-mu+0.6-threads30/lda-progress-mongo-s0.001-mu0.6-5327.csv"));
legends[[16]] <- "30 threads, sgd, momentum=0.6";


pdf("../../figures/v2/expt-10-all-0.pdf")

plot(data[[1]]$time, data[[1]]$objective, ylim=c(-48000, -39000), type="n", xlab="Runtime (seconds)", ylab="ELBo", main="LDA");

colors <- rainbow(18)

for (i in 1:16){
    # lines(data[[i]]$time, denoise(data[[i]]$objective), col=colors[i])
}

legend("bottomright", legend=legends, col=colors, lty=1)

dev.off()