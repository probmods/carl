Archive.zip : index.js node_modules
	@zip -rq Archive.zip index.js node_modules
	@echo 'done'

node_modules :
	@npm install

watch :
	@while kqwait index.js node_modules; do make Archive.zip; done
