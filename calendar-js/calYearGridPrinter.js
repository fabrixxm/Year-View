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

        if (aStart && aEnd) {
            for(var year = aStart.year; year < aEnd.year; year++) {
                var thisYearDate = aStart.clone();
                thisYearDate.month = 0;
                thisYearDate.day = 1;
                this.setupYear(document, thisYearDate, dayTable);
            }
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

            let boxDate = itemStartDate.clone();
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
                    this.setupYear(document, boxDate, dayTable);
                }

                let dayBox = dayTable[boxDateKey];
               

                dayBox.classList.add("event");
               
            }
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
        const weekdayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    
        let yearTemplate = document.getElementById("year-template");
        let dayTemplate = document.getElementById("month-row-template");

        // Clone the template  and make sure it doesn't have an id
        let currentYear = yearTemplate.cloneNode(true);
        currentYear.removeAttribute("id");
        currentYear.querySelector(".year-name").textContent = thisdate.year;

        var maxday=37;

        // Set up the month title
        for (var i = 1; i<13; i++) {
            let monthName = cal.l10n.getAnyString("calendar", "dateFormat", "month." + i + ".Mmm");
            currentYear.querySelector(".month"+i+"-name").textContent = monthName;
        }

        let yearTable = currentYear.querySelector("#year-table");

        var mDate = thisdate.clone();
        for (var i=0; i<maxday; i++) {
            let dayBoxes = dayTemplate.cloneNode(true);
            dayBoxes.removeAttribute("id");
            var weekDay = i % 7;
            var weekDayLabel = cal.getDateFormatter().shortDayName(weekDay)[0];
            dayBoxes.querySelector(".day-name").textContent = weekDayLabel;
           
            var dayOffPrefName = "calendar.week.d" + weekDay + weekdayMap[weekDay] + "soff";
            if (Preferences.get(dayOffPrefName, false)) {
                dayBoxes.className += " day-off";
            }

            yearTable.appendChild(dayBoxes);
            
            for(var m=0; m<12; m++) {
                mDate.day = 1;
                mDate.month = m;
                mDate.year = thisdate.year;            
                var firstday =  mDate.weekday;
                var lastday = mDate.endOfMonth.day+mDate.weekday;
                
                var dayBox = dayBoxes.querySelector(".month"+(m+1)+"-day");
                
                
                if (i>= firstday && i<=lastday) {
                    mDate.day = i - firstday;
                    var dateKey = cal.print.getDateKey(mDate);
                    dayTable[dateKey] = dayBox
                } else {
                    dayBox.className += " out-of-month";
                }
            }
        }

        document.getElementById("year-container").appendChild(currentYear);
  },

   
};
