/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="./../main.ts" />

namespace ConvertKit
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
        
        /**
        Handles signing out, which deletes the user's ConvertKit secret key from storage.
        */
        public HandleSignoutEvent = (context, event) =>
        {
            Utils.ShowDialog("Are you sure you want to sign out?", "Signing out will erase your secret key from this app's local storage. You'll need to enter it again to use the app.", "Sign out", (e) =>
            {
                if (e.detail.result === "primary")
                {
                    Utils.LocalStorage.Delete(Strings.SecretKeyId);
                
                    //Send the user back to the login page.
                    WinJS.Navigation.navigate(LoginController.PageUrl).done(() =>
                    {
                        //Erase the back stack
                        WinJS.Navigation.history = [];

                        //Destroy any persisted controllers, which retain secret keys and subscriber data.
                        Main.State.FormsController = null;
                        Main.State.HomeController = null;
                        Main.State.SettingsController = null;
                    });
                };
            }, true);
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
