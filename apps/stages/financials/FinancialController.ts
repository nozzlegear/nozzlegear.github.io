/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../lib/custom/stagesclient/stagesclient.ts" />
module App.Stages
{
    export class FinancialController
    {
        constructor(state?: { Plans: Stages.Entities.API.ApplicationPlan[] })
        {
            this.RegisterKnockoutSubscriptions();

            if (state && state.Plans)
            {
                this.HandleLoadSuccess(state.Plans);

                return;
            };

            //Load the subscribers
            this.HandleRefreshEvent();
        }

        //#region Variables

        private Service = new Stages.AdminFinancialService(Utils.LocalStorage.Retrieve("X-Stages-API-Key"));

        public SubscribedPlans = ko.observableArray<Stages.Entities.API.ApplicationPlan>();

        public IsLoading = ko.observable(false);

        //#endregion        

        //#region Utility functions

        private RegisterKnockoutSubscriptions()
        {
            this.IsLoading.subscribe((newValue) =>
            {
                var container = document.getElementById("data-container");
                WinJS.UI.Animation.enterContent(container);
            });
        }

        private HandleLoadSuccess = (currentPlans: Stages.Entities.API.ApplicationPlan[]) =>
        {
            this.SubscribedPlans(currentPlans);
            
            this.IsLoading(false);
        };

        private HandleLoadFailure = (error) =>
        {
            this.IsLoading(false);

            Utils.ShowDialog("Error", "Failed to retrieve subscriber data.");
        };

        /**
        A client restored from JSON does not contain observables or functions. Use this 
        function to merge and restore a previous controller state. This method requires that 
        creating the new controller sets up ALL knockout observables. They cannot be null after
        constructing.
        */
        static MergeAndRestore = (lastState) =>
        {
            var client = new FinancialController();
 
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

        //#region Page event handlers

        public HandleAppBarUpdate = (context, element: HTMLElement) =>
        {
            //AppBars are kind of jerky, taking a bit to show up. Wait 1 second for it to get 
            //loaded into the dom, then slide it up.
            setTimeout(() =>
            {
                element.style.display = null;
                element.winControl.forceLayout();
                WinJS.UI.Animation.slideUp(element);
            }, 900);
        };

        /**
        Handles refreshing data.
        */
        public HandleRefreshEvent = (context?, event?) =>
        {
            if (!this.IsLoading())
            {
                this.IsLoading(true);

                if (!window.navigator.onLine)
                {
                    Utils.ShowDialog("No internet connection", "It looks like your device does not have an active internet connection. Please try again.");

                    this.IsLoading(false);

                    return;
                }

                this.Service.GetAsync().done(this.HandleLoadSuccess, this.HandleLoadFailure);
            }
        };

        //#endregion

        /**
        The page's id.
        */
        static get PageId()
        {
            return "Financials";
        };

        /** 
        The page's URL, relative from the app root.
        */
        static get PageUrl()
        {
            return "financials/financials.html";
        }; 

        /**
        Defines the controller's WinJS navigation functions.
        */
        static DefinePage()
        {            
            WinJS.UI.Pages.define(FinancialController.PageUrl, {
                init: (element, options) =>
                {

                },
                processed: (element, options) =>
                {

                },
                ready: (element, options) =>
                {
                    var client = App.Stages.Main.State.FinancialController || new FinancialController(options);

                    //Track the current page
                    App.Stages.Main.CurrentPage(FinancialController.PageId);
                    App.Stages.Main.State.FinancialController = client;
                    
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);

                    ko.applyBindings(client, element);
                },
                error: (err) =>
                {
                    alert("Error loading FinancialController.");
                },
            });
        }
    }
}