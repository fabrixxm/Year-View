/* -*- Mode: javascript; tab-width: 20; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla Calendar code.
 *
 * The Initial Developer of the Original Code is
 *   Joey Minta <jminta@gmail.com>
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Matthew Willis <mattwillis@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * Prints a rough month-grid of events/tasks
 */

function calYearGridPrinter() {
    //dump("calYearGridPrinter\n");
    Components.utils.import("resource://calendar/modules/calUtils.jsm");
    this.cal = cal;
    this.wrappedJSObject = this;
}

calYearGridPrinter.prototype.QueryInterface =
function QueryInterface(aIID) {
    if (!aIID.equals(Components.interfaces.nsISupports) &&
        !aIID.equals(Components.interfaces.calIPrintFormatter)) {
        throw Components.results.NS_ERROR_NO_INTERFACE;
    }
    return this;
};

calYearGridPrinter.prototype.getName =
function yearPrint_getName() {
    //calendar-js/calUtils.js:630
    name = this.cal.calGetString("calendaryearview","yearPrinterName",null,"calendaryearview");
    return name;
};
calYearGridPrinter.prototype.__defineGetter__("name", calYearGridPrinter.prototype.getName);

calYearGridPrinter.prototype.formatToHtml =
function yearPrint_format(aStream, aStart, aEnd, aCount, aItems, aTitle) {
    var html = <html/>
    html.appendChild(
            <head>
                <title>{aTitle}</title>
                <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'/>
                <style type='text/css'/>
            </head>);
    html.head.style = "body { margin:0px; padding:0px; }\n";                
    html.head.style += ".main-table { font-size: 16px; font-weight: bold; }\n";
    html.head.style += ".day-name { border: 1px solid black; background-color: #e0e0e0; font-size: 8px; font-weight: bold; }\n";
    html.head.style += ".day-box { border: 1px solid black; vertical-align: top; }\n";
    html.head.style += ".out-of-month { background-color: gray !important; }\n";
    html.head.style += ".day-off { background-color: #D3D3D3 !important; }\n";
    // http://www.xefteri.com/articles/show.cfm?id=26
    html.head.style += "thead { display:table-header-group; }\n";
    html.head.style += "tbody { display:table-row-group; }\n";
    // If aStart or aEnd weren't passed in, we need to calculate them based on
    // aItems data.

    var start = aStart;
    var end = aEnd;
    if (!start || !end) {
        for each (var item in aItems) {
            var itemStart = item.startDate || item.entryDate;
            var itemEnd = item.endDate || item.dueDate;
            if (!start || (itemStart && start.compare(itemStart) == 1)) {
                start = itemStart;
            }
            if (!end || (itemEnd && end.compare(itemEnd) == -1)) {
                end = itemEnd;
            }
        }
    }
    
    
    // from start of the year to the end of the year
    start = start.clone();
    start.month=0;
    start.day=1;
    end = end.clone();
    end.day -= 1;
    end.month=11;
    end.day=31;
    
    var date = start.clone();

    
    // First we have to adjust the end date for comparison, as the
    // provided end date is exclusive, i.e. will not be displayed.

    //~ var realEnd = end.clone();
    //~ realEnd.day -= 1;
  
    var body = <body/>
    
    
    while (date.compare(end) < 0) {
        var yearName = date.year;
        body.appendChild(
                     <table border='0' width='100%' class='main-table'>
                         <tr> 
                             <td align='center' valign='bottom'>{yearName}</td>
                         </tr>
                     </table>);
        body.appendChild(this.getStringForYear(date, aItems));
        // Make sure each year gets put on its own page
        body.appendChild(<br style="page-break-after:always;"/>);
        date.year++;
    }
    html.appendChild(body);

    var convStream = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                               .createInstance(Components.interfaces.nsIConverterOutputStream);
    convStream.init(aStream, 'UTF-8', 0, 0x0000);
    convStream.writeString(html.toXMLString());
};

calYearGridPrinter.prototype.getStringForYear =
function yearPrint_getHTML(aStart, aItems) {
    try {
        var yearTable = <table style='border:1px solid black;' width='100%'><thead/><tbody/></table>
        var monthNameRow = <tr/>;
        monthNameRow.appendChild(<th class='day-name' align='center'>-</th>);
        for (var m=0; m<12; m++) {
            var monthName = this.cal.calGetString("dateFormat", "month."+ (m+1) + ".Mmm");
            monthNameRow.appendChild(<th class='day-name'>{monthName}</th>);
        }
        yearTable.thead.appendChild(monthNameRow);
        

        // Set up the item-list so it's easy to work with.
        function hasUsableDate(item) {
            return item.startDate || item.entryDate || item.dueDate;
        }
        var filteredItems = aItems.filter(hasUsableDate);
        
        var calIEvent = Components.interfaces.calIEvent;
        var calITodo = Components.interfaces.calITodo
        function compareItems(a, b) {
            // Sort tasks before events
            if (this.cal.isEvent(a) && this.cal.isToDo(b)) {
                return 1;
            }
            if (this.cal.isToDo(a) && this.cal.isEvent(b)) {
                return -1;
            }
            if (this.cal.isEvent(a)) {
                var startCompare = a.startDate.compare(b.startDate);
                if (startCompare != 0) {
                    return startCompare;
                }
                return a.endDate.compare(b.endDate);
            }
            var aDate = a.entryDate || a.dueDate;
            var bDate = b.entryDate || b.dueDate;
            return aDate.compare(bDate);
        }
        var sortedList = filteredItems.sort(compareItems);
        
        var dayRow;
        var dayName
        date = aStart.clone();
        for (var d = 0; d < 37; d++) {
            dayRow = <tr/>
            dayName = this.cal.calGetString("dateFormat", "day."+ ((d%7)+1) + ".Mmm");
            dayRow.appendChild(<td class='day-name' align='center' width='50'>{dayName}</td>);
            for (var m=0; m<12; m++){
                date.day = 1;
                date.month = m
                var mstart = date.jsDate.getDay(); 
                var mend = date.endOfMonth.day+mstart;
                if (d<mstart || d>=mend) {
                    dayRow.appendChild(<td class='out-of-month'  align='left' valign='top' ></td>);
                } else {
                    date.day = d-mstart+1;
                    dayRow.appendChild(this.makeHTMLDay(date, sortedList));
                }
                
            }
            yearTable.tbody.appendChild(dayRow);
        }
    } catch(ex) {
        dump("calYearGridPrinter::getStringForYear Error:\n"+ex+"\n\n");
    }

    return yearTable;
    
};

calYearGridPrinter.prototype.makeHTMLDay =
function makeHTMLDay(date, sortedList) {
    const weekPrefix = "calendar.week.";
    var prefNames = ["d0sundaysoff", "d1mondaysoff", "d2tuesdaysoff",
                     "d3wednesdaysoff", "d4thursdaysoff", "d5fridaysoff", "d6saturdaysoff"];
    var defaults = [true, false, false, false, false, false, true];
    var daysOff = new Array();
    for (var i in prefNames) {
        if ( this.cal.getPrefSafe(weekPrefix+prefNames[i], defaults[i])) {
            daysOff.push(Number(i));
        }
    }
    //~ var monthName = this.cal.calGetString("dateFormat", "month."+ (date.month+1) + ".Mmm");
    try {
         var myClass = 'day-box';
         if (daysOff.some(function(a) { return a == date.weekday; })) {
             myClass += ' day-off';
         }
         var day = <td align='left' valign='top' class={myClass} width='50'/>
         var innerTable = <table valign='top' style='font-size: 10px;'/>
         var dateLabel = <tr valign='top'>
                             <td valign='top' align='left'>{date.day}</td>
                         </tr>
         innerTable.appendChild(dateLabel);
         var defaultTimezone =  this.cal.calendarDefaultTimezone();
         for each (var item in sortedList) {
             var sDate = item.startDate || item.entryDate || item.dueDate;
             var eDate = item.endDate || item.dueDate || item.entryDate;
             if (sDate) {
                 sDate = sDate.getInTimezone(defaultTimezone);
             }
             if (eDate) {
                 eDate = eDate.getInTimezone(defaultTimezone);
             }

             // end dates are exclusive
             if (sDate.isDate) {
                 eDate = eDate.clone();
                 eDate.day -= 1;
             }
             if (!eDate || eDate.compare(date) == -1) {
                 continue;
             }
             itemListIndex = i;
             if (!sDate || sDate.compare(date) == 1) {
                 break;
             }
             var dateFormatter = 
                     Components.classes["@mozilla.org/calendar/datetime-formatter;1"]
                               .getService(Components.interfaces.calIDateTimeFormatter);
             var time = "";
             if (!sDate.isDate) {
                 time = dateFormatter.formatTime(sDate);
             }

             var calColor = item.calendar.getProperty('color');
             if (!calColor) {
                 calColor = "#A8C2E1";
             }
             var pb2 = Components.classes["@mozilla.org/preferences-service;1"]
                                 .getService(Components.interfaces.nsIPrefBranch2);
             var catColor;
             for each (var cat in item.getCategories({})) {
                 try {
                     catColor = pb2.getCharPref("calendar.category.color." + cat.toLowerCase());
                     break; // take first matching
                 } catch(ex) {}
             }

             var style = 'font-size: 6px; text-align: left;';
             style += ' background-color: ' + calColor + ';';
             style += ' color: ' + this.cal.getContrastingTextColor(calColor);
             if (catColor) {
                 style += ' border: solid ' + catColor + ' 2px;';
             }
             var item = <tr>
                            <td valign='top' style={style}>{time} {item.title}</td>
                        </tr>;
             innerTable.appendChild(item);
         }
         day.appendChild(innerTable);
     } catch(ex) {
         dump("calYearGridPrinter.makeHTMLDay Error:\n"+ex+"\n\n")
     }
     return day;
}

