const componentData =
    [
    {cid: Components.ID("{8761c2a1-791d-4bf7-ae59-e1a4553f2497}"),
     contractid: "@mozilla.org/calendar/printformatter;1?type=year",
     script: "calYearGridPrinter.js",
     constructor: "calYearGridPrinter",
     category: "cal-print-formatters",
     categoryEntry: "cal-year-printer",
     service: false},
    
    {cid: null,
     contractid: null,
     script: "calUtils.js",
     constructor: null,
     category: null,
     categoryEntry: null,
     service: false},

    ];

var calYearPrintModule = {
    mScriptsLoaded: false,
    loadScripts: function () {
        //dump("calYearPrintModule::loadScripts\n");
        if (this.mScriptsLoaded)
            return;
        
        baseDir = __LOCATION__.parent.parent.clone();
        baseDir.append("calendaryearview-js");
        //dump("\tbaseDir: "+baseDir.path+"\n");
        Components.utils.import("resource://calendar/modules/calUtils.jsm");
        cal.loadScripts(componentData.map(function(entry) { return entry.script; }),
                        this.__parent__,
                        baseDir);

        this.mScriptsLoaded = true;
    },

    registerSelf: function (compMgr, fileSpec, location, type) {
        compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);

        var catman = Components.classes["@mozilla.org/categorymanager;1"]
            .getService(Components.interfaces.nsICategoryManager);
        for (var i = 0; i < componentData.length; i++) {
            var comp = componentData[i];
            if (!comp.cid)
                continue;
            compMgr.registerFactoryLocation(comp.cid,
                                            "",
                                            comp.contractid,
                                            fileSpec,
                                            location,
                                            type);

            if (comp.category) {
                var contractid;
                if (comp.service)
                    contractid = "service," + comp.contractid;
                else
                    contractid = comp.contractid;
                catman.addCategoryEntry(comp.category, comp.categoryEntry,
                                        contractid, true, true);
            }
        }
    },

    makeFactoryFor: function(constructor) {
        var factory = {
            QueryInterface: function (aIID) {
                if (!aIID.equals(Components.interfaces.nsISupports) &&
                    !aIID.equals(Components.interfaces.nsIFactory))
                    throw Components.results.NS_ERROR_NO_INTERFACE;
                return this;
            },

            createInstance: function (outer, iid) {
                if (outer != null)
                    throw Components.results.NS_ERROR_NO_AGGREGATION;
                return (new constructor()).QueryInterface(iid);
            }
        };

        return factory;
    },

    getClassObject: function (compMgr, cid, iid) {
        //dump("calYearPrintModule::getClassObject\n");
        if (!iid.equals(Components.interfaces.nsIFactory))
            throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

        if (!this.mScriptsLoaded)
            this.loadScripts();

        for (var i = 0; i < componentData.length; i++) {
            if (cid.equals(componentData[i].cid)) {
                if (componentData[i].onComponentLoad) {
                    this.__parent__[componentData[i].onComponentLoad]();
                }
                // eval to get usual scope-walking
                /*dump("getClassObject\n");
                dump("\tcontructor: "+ componentData[i].constructor+"\n");
                dump("\t\t : "+ this.__parent__+"\n");
                dump("\t\t : "+ this.__parent__[componentData[i].constructor]+"\n");*/
                return this.makeFactoryFor(this.__parent__[componentData[i].constructor]);
            }
        }

        throw Components.results.NS_ERROR_NO_INTERFACE;
    },

    canUnload: function(compMgr) {
        return true;
    }
};

function NSGetModule(compMgr, fileSpec) {
    //dump("NSGetModule\n");
    return calYearPrintModule;
}
