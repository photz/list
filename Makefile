.PHONY: watch build

watch:
	ls main.js | grep -v '#' | entr -r make build

build:
	java -jar closure-compiler-v20170910.jar --externs ext.js --compilation_level ADVANCED --strict_mode_input --warning_level VERBOSE main.js > out.js
