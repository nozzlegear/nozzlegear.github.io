/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="./financials/financialcontroller.ts" />
/// <reference path="./settings/settingscontroller.ts" />
/// <reference path="./login/logincontroller.ts" />
/// <reference path="./subscribers/subscribercontroller.ts" />



namespace Stages
{
    export class Main
    {
        /**
        A static and magical object that persists controller states when navigating. Better than WinJS.navigation.state, which only works when using .back or .forward.
        */
        static State: {
            SubscriberController?: Stages.SubscriberController;
            FinancialController?: Stages.FinancialController;
            SettingsController?: Stages.SettingsController;
        } = {};

        /**
        Starts the application
        */
        static Start = () =>
        {
            var app = WinJS.Application;
            
            app.onactivated = function (args)
            {
                //Define pages 
                _.forOwn(Stages, (value, key) =>
                {
                    if (_.has(value, "DefinePage")) 
                    {
                        value.DefinePage();
                    }
                });

                if (args.detail.kind === "Windows.Launch")
                {
                    //Begin processing UI.
                    var appPromise = WinJS.UI.processAll();
                    
                    //Apply page-level bindings to app. Will not trump view-specific bindings thanks to the custom stopBinding binding.
                    ko.applyBindings(this);

                    //Ensure sessionState.Main exists
                    app.sessionState.Main = app.sessionState.Main || {};

                    //Restore application state
                    Main.State = JSON.parse(app.sessionState.Main.StateJSON || "{}");
                    Main.CurrentPage(app.sessionState.Main.LastPage);

                    //Merge and restore previous controllers
                    _.forOwn(Main.State, (value, key) =>
                    {
                        try
                        {
                            if (_.has(Stages[key], "MergeAndRestore"))
                            {
                                Main.State[key] = Stages[key].MergeAndRestore(value);
                            };
                        }
                        catch (e)
                        {
                            //Delete the value from state. If app fails to recreate state, it can recover by creating a new controller from scratch.
                            Main.State[key] = null;
                        }
                    });

                    //Navigate to the home page
                    appPromise = appPromise
                        .then(() =>
                        {
                            //Check if the user has entered their API key
                            if (Utils.LocalStorage.Retrieve("X-Stages-API-Key"))
                            {
                                //Navigate to the last known page if available, else go to home.
                                return WinJS.Navigation.navigate(Main.CurrentPage() ? Stages[Main.CurrentPage()].PageUrl : SubscriberController.PageUrl, WinJS.Navigation.state);
                            }
                                
                            //Navigate to the login controller.
                            return WinJS.Navigation.navigate(LoginController.PageUrl, WinJS.Navigation.state);
                        }).then(null, (error) => { console.log("Error loading page", error) });

                    appPromise.done(() => { console.log("Done"); }, (error) => { console.log("Error loading page 2", error); });
                };
            };

            app.oncheckpoint = function (args)
            {
                // TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
                // You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
                // If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
            };

            app.start();
        };

        static CurrentPage = ko.observable<string>();

        /**
        Navigates the user to the subscribers page.
        */
        static HandleNavigateToSubscribers = (context, eventOrState) =>
        {
            if (Main.CurrentPage() !== SubscriberController.PageId)
            {
                WinJS.Navigation.navigate(SubscriberController.PageUrl, eventOrState);

                Main.CloseSplitviewPane();
            };
        };

        /**
        Navigates the user to the financials page.
        */
        static HandleNavigateToFinancials = (context, event) =>
        {
            if (Main.CurrentPage() !== FinancialController.PageId)
            {
                WinJS.Navigation.navigate(FinancialController.PageUrl);

                Main.CloseSplitviewPane();
            };
        };

        /**
        Attempts to refresh the current page by calling client.HandleRefreshEvent. It's up to the page controller 
        to make itself available via WinJS.Namespace.define("client", ...);.
        */
        static HandleRefreshEvent = (context, event) =>
        {
            var client = window["client"];

            if (client && client.HandleRefreshEvent)
            {
                client.HandleRefreshEvent(context, event);
            }
        };

        /**
        Navigates the user to the settings page.
        */
        static HandleNavigateToSettings = (context, event) =>
        {
            if (Main.CurrentPage() !== SettingsController.PageId)
            {
                WinJS.Navigation.navigate(SettingsController.PageUrl);

                Main.CloseSplitviewPane();
            };
        };

        /**
        * Closes the splitview menu pane.
        */
        static CloseSplitviewPane = () =>
        {
            var sv = document.getElementById("splitview").winControl;

            sv.closePane();
        };
    }
}

Stages.Main.Start();