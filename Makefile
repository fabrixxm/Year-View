CHROMEFILES=$(shell find chrome)
COMPONENTSFILES=$(shell find components)
JSFILES=$(shell find calendar-js)
VERSION=$(shell grep "<em:version>" install.rdf | sed "s/[^0-9.-]*//g")
OUTPUT=Year-View-v${VERSION}.xpi
TUNDERBIRD=$(shell ./devtools.py --exec)
PROFILEPATH=$(shell ./devtools.py --profile)
CACHEPATH=$(shell ./devtools.py --cache)


${OUTPUT}: install.rdf chrome.manifest ${CHROMEFILES} ${COMPONENTSFILES} ${JSFILES}
	zip -r ${OUTPUT} install.rdf chrome.manifest chrome components calendar-js


.PHONY: clean run
clean:
	rm -f ${OUTPUT}

# this ONLY ON OSX, only with THIS PROFILE
run:
	rm ${CACHEPATH}/startupCache/*
	${TUNDERBIRD} --jsconsole

dev-install:
	echo $(PWD) > "${PROFILEPATH}/extensions/yearview@kirgroup.com"
