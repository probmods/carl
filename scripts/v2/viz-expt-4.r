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
legends[[1]] <- "momentum=0.3";

data[[2]] <- read.csv(file.path(basepath, "s0.001-mu+0.6-threads08/lda-progress-mongo-s0.001-mu0.6-6716.csv"));
legends[[2]] <- "momentum=0.6";

# data[[3]] <- read.csv(file.path(basepath, "0.99-0.999/lda-progress-mongo-0.99-0.999-5311.csv"));
# legends[[3]] <- "b1=0.99, b2=0.999";
# 
# data[[4]] <- read.csv(file.path(basepath, "0.999-0.999/lda-progress-mongo-0.999-0.999-5092.csv"));
# legends[[4]] <- "b1=0.999, b2=0.999";
# 
# data[[5]] <- read.csv(file.path(basepath, "0.999-1/lda-progress-mongo-0.999-1-5101.csv"));
# legends[[5]] <- "b1=0.999, b2=1";

# data[[6]] <- read.csv(file.path(basepath, "30-threads/lda-progress-mongo-2750.csv"));
# legends[[6]] <- "30 threads";

pdf("../../figures/v2/expt-4-8-threads-momentum-denoise.pdf")

plot(data[[1]]$time, data[[1]]$objective, ylim=c(-48000, -39000), type="n", xlab="Runtime (seconds)", ylab="ELBo", main="LDA (8 threads, step size 0.001)");

colors <- rainbow(6)

for (i in 1:2){
    lines(data[[i]]$time, denoise(data[[i]]$objective), col=colors[i])
}

legend("bottomright", legend=legends, col=colors, lty=1)

dev.off()