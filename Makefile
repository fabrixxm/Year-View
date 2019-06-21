CHROMEFILES=$(shell find chrome)
COMPONENTSFILES=$(shell find components)
JSFILES=$(shell find calendar-js)
VERSION=$(shell grep "<em:version>" install.rdf | sed "s/[^0-9.-]*//g")
OUTPUT=Year-View-v${VERSION}.xpi
TUNDERBIRD=$(shell ./devtools.py --exec)
PROFILEPATH=$(shell ./devtools.py --profile)
CACHEPATH=$(shell ./devtools.py --cache)


.PHONY: clean run help all

all: ${OUTPUT}

${OUTPUT}: install.rdf chrome.manifest ${CHROMEFILES} ${COMPONENTSFILES} ${JSFILES}
	zip -r ${OUTPUT} install.rdf chrome.manifest chrome components calendar-js

clean:
	rm -f ${OUTPUT}

# this ONLY ON OSX, only with THIS PROFILE
run:
	rm ${CACHEPATH}/startupCache/*
	${TUNDERBIRD} --jsconsole

dev-install:
	echo $(PWD) > "${PROFILEPATH}/extensions/yearview@kirgroup.com"

help:
	@echo "targets:"
	@echo
	@echo "\tall\t\tcreate or update ${OUTPUT} (default)"
	@echo "\tclean\t\tdelete build"
	@echo "\trun\t\trun thunderbird with clean startup cache and the js console"
	@echo "\tdev-install\tinstall Year-View in thunderbird in development mode"
	@echo