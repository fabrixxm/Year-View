CHROMEFILES=$(shell find chrome)
VERSION=$(shell grep "<em:version>" install.rdf | sed "s/[^0-9.-]*//g")
OUTPUT=Year-View-v${VERSION}.xpi

${OUTPUT}: install.rdf chrome.manifest ${CHROMEFILES}
	zip -r ${OUTPUT} install.rdf chrome.manifest chrome


.PHONY: clean
clean:
	rm -f ${OUTPUT}