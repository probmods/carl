function serve() {
  console.log('[decide] nothing to do yet');
}

if (require.main === module) {
  serve();
}

module.exports = {
  serve
};
