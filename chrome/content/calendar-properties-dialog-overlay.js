/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
Components.utils.import("resource://calendar/modules/calUtils.jsm");

/**
 * The calendar to modify, is retrieved from window.arguments[0].calendar
 */
let gCalendar;

window.addEventListener("load", yw_onLoad);
window.addEventListener("dialogaccept", yw_onAcceptDialog);



/**
 * This function gets called when the calendar properties dialog gets opened. To
 * open the window, use an object as argument. The object needs a 'calendar'
 * attribute that passes the calendar in question.
 */
function yw_onLoad() {
    gCalendar = window.arguments[0].calendar;
    let calHideYear = gCalendar.getProperty('yearview.hide');

    document.getElementById("hide-yearview").checked = calHideYear;

    console.log(document, window);
}

/**
 * Called when the dialog is accepted, to save settings.
 *
 * @return      Returns true if the dialog should be closed.
 */
function yw_onAcceptDialog() {
    gCalendar.setProperty("yearview.hide", document.getElementById("hide-yearview").checked);
}
