/// <reference path="./../../../typings/tsd.d.ts" />
/// <reference path="./../main.ts" />

namespace Stages
{
    export class SettingsController
    {
        constructor()
        {
            this.RegisterKnockoutSubscriptions();
        }

        //#region Variables
        
        public IsLoading = ko.observable(false);

        public Notifications = {
            Enabled: ko.observable(true),
            Timer: ko.observable(15),
        };

        //#endregion

        //#region Utility functions

        private RegisterKnockoutSubscriptions()
        {
        }
        
        /**
        A client restored from JSON does not contain observables or functions. Use this 
        function to merge and restore a previous controller state. This method requires that 
        creating the new controller sets up ALL knockout observables. They cannot be null after
        constructing.
        */
        static MergeAndRestore = (lastState) =>
        {
            var client = new SettingsController();
 
            //Assign values from previous state.
            _.forOwn(lastState, (value, key) =>
            {
                var clientValue = client[key];

                if (ko.isObservable(clientValue))
                {
                    clientValue(value);

                    return;
                };

                client[key] = value;
            });

            return client;
        };

        //#endregion

        /**
        The page's id.
        */
        static get PageId()
        {
            return "Settings";
        };

        /** 
        The page's URL, relative from the app root.
        */
        static get PageUrl()
        {
            return "settings/settings.html";
        }; 

        /**
        Defines the controller's WinJS navigation functions.
        */
        static DefinePage()
        {
            WinJS.UI.Pages.define(SettingsController.PageUrl, {
                init: (element, options) =>
                {

                },
                processed: (element, options) =>
                {

                },
                ready: (element, options) =>
                {
                    var client = Main.State.SettingsController || new SettingsController();

                    //Track the current page
                    Main.CurrentPage(SettingsController.PageId);
                    Main.State.SettingsController = client;

                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);

                    ko.applyBindings(client, element);
                },
                error: (err) =>
                {
                    alert("Error loading SettingsController.");
                }
            });
        }
    }
}