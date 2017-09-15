.PHONY: watch build

watch:
	ls *.js | grep -v '#' | entr -r make build

build:
	java -jar closure-compiler-v20170910.jar --compilation_level ADVANCED --strict_mode_input --checks-only --warning_level VERBOSE main.js
