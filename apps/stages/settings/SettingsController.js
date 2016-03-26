/// <reference path="./../../../typings/tsd.d.ts" />
/// <reference path="./../main.ts" />
var Stages;
(function (Stages) {
    var SettingsController = (function () {
        function SettingsController() {
            //#region Variables
            this.IsLoading = ko.observable(false);
            this.Notifications = {
                Enabled: ko.observable(true),
                Timer: ko.observable(15),
            };
            this.RegisterKnockoutSubscriptions();
        }
        //#endregion
        //#region Utility functions
        SettingsController.prototype.RegisterKnockoutSubscriptions = function () {
        };
        Object.defineProperty(SettingsController, "PageId", {
            //#endregion
            /**
            The page's id.
            */
            get: function () {
                return "Settings";
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(SettingsController, "PageUrl", {
            /**
            The page's URL, relative from the app root.
            */
            get: function () {
                return "settings/settings.html";
            },
            enumerable: true,
            configurable: true
        });
        ;
        /**
        Defines the controller's WinJS navigation functions.
        */
        SettingsController.DefinePage = function () {
            WinJS.UI.Pages.define(SettingsController.PageUrl, {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client = Stages.Main.State.SettingsController || new SettingsController();
                    //Track the current page
                    Stages.Main.CurrentPage(SettingsController.PageId);
                    Stages.Main.State.SettingsController = client;
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading SettingsController.");
                }
            });
        };
        /**
        A client restored from JSON does not contain observables or functions. Use this
        function to merge and restore a previous controller state. This method requires that
        creating the new controller sets up ALL knockout observables. They cannot be null after
        constructing.
        */
        SettingsController.MergeAndRestore = function (lastState) {
            var client = new SettingsController();
            //Assign values from previous state.
            _.forOwn(lastState, function (value, key) {
                var clientValue = client[key];
                if (ko.isObservable(clientValue)) {
                    clientValue(value);
                    return;
                }
                ;
                client[key] = value;
            });
            return client;
        };
        return SettingsController;
    }());
    Stages.SettingsController = SettingsController;
})(Stages || (Stages = {}));
