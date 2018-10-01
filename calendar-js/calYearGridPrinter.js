/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

ChromeUtils.import("resource://gre/modules/XPCOMUtils.jsm");
ChromeUtils.import("resource://gre/modules/Preferences.jsm");

ChromeUtils.import("resource://calendar/modules/calUtils.jsm");

/**
 * Prints a rough month-grid of events/tasks
 */
function calYearPrinter() {
    this.wrappedJSObject = this;
}

var calYearPrinterClassID = Components.ID("{9977735b-9418-47e5-b5b6-0e9f8981ac49}");
var calYearPrinterInterfaces = [Components.interfaces.calIPrintFormatter];
calYearPrinter.prototype = {
    classID: calYearPrinterClassID,
    QueryInterface: XPCOMUtils.generateQI(calYearPrinterInterfaces),

    classInfo: XPCOMUtils.generateCI({
        classID: calYearPrinterClassID,
        contractID: "@mozilla.org/calendar/printformatter;1?type=yeargrid",
        classDescription: "Calendar Month Grid Print Formatter",
        interfaces: calYearPrinterInterfaces
    }),

    get name() { return cal.l10n.getAnyString("calendaryearview", "calendaryearview", "yearPrinterName"); },

    formatToHtml: function(aStream, aStart, aEnd, aCount, aItems, aTitle) {
        let document = cal.xml.parseFile("chrome://calendaryearview/content/printing/calYearGridPrinter.html");
        let defaultTimezone = cal.dtz.defaultTimezone;

        // Set page title
        document.getElementById("title").textContent = aTitle;

        // Table that maps YYYY-MM-DD to the DOM node container where items are to be added
        let dayTable = {};


        
        for(var year = aStart.year; year <= aEnd.year; year++) {
            var thisYearDate = aStart.clone();
            thisYearDate.month = 0;
            thisYearDate.day = 1;
            this.setupYear(document, thisYearDate, dayTable);
        }



        for (let item of aItems) {
            let itemStartDate = item[cal.dtz.startDateProp(item)] || item[cal.dtz.endDateProp(item)];
            let itemEndDate = item[cal.dtz.endDateProp(item)] || item[cal.dtz.startDateProp(item)];

            if (!itemStartDate && !itemEndDate) {
               // cal.print.addItemToDayboxNodate(document, item);
                continue;
            }
            itemStartDate = itemStartDate.getInTimezone(defaultTimezone);
            itemEndDate = itemEndDate.getInTimezone(defaultTimezone);

            /*let boxDate = itemStartDate.clone();
            boxDate.isDate = true;
            for (boxDate; boxDate.compare(itemEndDate) < (itemEndDate.isDate ? 0 : 1); boxDate.day++) {
                // Ignore items outside of the range, i.e tasks without start date
                // where the end date is somewhere else.
                if (aStart && aEnd && boxDate &&
                    (boxDate.compare(aStart) < 0 || boxDate.compare(aEnd) >= 0)) {
                    continue;
                }

                let boxDateKey = cal.print.getDateKey(boxDate);

                if (!(boxDateKey in dayTable)) {
                    // Doesn't exist, we need to create a new table for it
                    let startOfMonth = boxDate.startOfMonth;
                    this.setupMonth(document, startOfMonth, dayTable);
                }

                let dayBoxes = dayTable[boxDateKey];
                let addSingleItem = cal.print.addItemToDaybox.bind(cal.print, document, item, boxDate);

                if (Array.isArray(dayBoxes)) {
                    dayBoxes.forEach(addSingleItem);
                } else {
                    addSingleItem(dayBoxes);
                }
            }*/
        }

        // Remove templates from HTML, no longer needed
        let templates = document.getElementById("templates");
        templates.remove();

        // Stream out the resulting HTML
        let html = cal.xml.serializeDOM(document);
        let convStream = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                                   .createInstance(Components.interfaces.nsIConverterOutputStream);
        convStream.init(aStream, "UTF-8");
        convStream.writeString(html);
    },


    setupYear: function(document, thisdate, dayTable) {
      let yearTemplate = document.getElementById("year-template");
      let yearTable = document.getElementById("year-table");
      let dayTemplate = document.getElementById("month-row-template");

      // Clone the template  and make sure it doesn't have an id
      let currentYear = yearTemplate.cloneNode(true);
      currentYear.removeAttribute("id");
      currentYear.querySelector("year-name").textContent = thisdate.year;

      
      var maxday=37;

      // Set up the month title
      for (var i = 1; i<13; i++) {
        let monthName = cal.l10n.formatMonth( i, "calendar", "monthInYear");
        let monthTitle = cal.l10n.getCalString("monthInYear", [monthName, thisdate.year]);
        currentYear.querySelector(".month"+i+"-name").textContent = monthTitle;
      }

      
      
      document.getElementById("year-container").appendChild(currentYear);
  },

   
};
