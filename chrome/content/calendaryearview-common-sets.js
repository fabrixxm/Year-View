//

calendarController.commands["calendar_year-view_command"] = true;

calendarController._doCommand = calendarController.doCommand;
calendarController.doCommand = function(aCommand){
  document.getElementById("calendarWeek").style.display = "block";
	switch (aCommand) {
		case "calendar_year-view_command":
		  // hide weeks number label in year view
  		document.getElementById("calendarWeek").style.display = "none";
			switchCalendarView("year", true);
			break;		
		default:
			return this._doCommand(aCommand);
	}
}


calendarController._isCommandEnabled = calendarController.isCommandEnabled;
calendarController.isCommandEnabled = function(aCommand) {
	switch (aCommand) {
		case "calendar_year-view_command":
			return this.isInMode("calendar");		
		default:
			return this._isCommandEnabled(aCommand);
	}

}
