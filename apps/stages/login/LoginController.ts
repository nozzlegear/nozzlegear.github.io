

module App.Stages
{
    export class LoginController
    {
        constructor()
        {
            this.RegisterKnockoutSubscriptions();
        }

        //#region Variables
        
        public IsLoading = ko.observable(false);

        public SecretKey = ko.observable("");

        private Service: Stages.AdminSubscriberService;
        
        //#endregion

        //#region Utility functions

        private RegisterKnockoutSubscriptions()
        {

        }

        //#endregion

        //#region Page event handlers

        public HandleLoginEvent = (context, event) =>
        {
            if (!this.SecretKey())
            {
                Utils.ShowDialog("Error", "You must enter a valid API key or access token to continue.");

                return;
            }

            this.IsLoading(true);
            this.Service = new Stages.AdminSubscriberService(this.SecretKey());
            
            //Try to pull in subscribers. If it fails, API key was incorrect.
            var getSubs = this.Service.GetAsync("subscribed");

            var success = (subs: Stages.Entities.API.Account[]) =>
            {
                //Save the key in localstorage
                App.Utils.LocalStorage.Save("X-Stages-API-Key", this.SecretKey());

                var state: Entities.SubscriberController.ExpectedState = {
                    Accounts: subs
                };

                //Navigate to home page, passing along the subscriber list
                Main.HandleNavigateToSubscribers(this, state);
            };

            var fail = (reason) =>
            {
                console.log("Failed to get subscribers. Reason: ", reason);

                Utils.ShowDialog("Error", "It looks like your secret key or access token is invalid. Please try again.");
                
                this.IsLoading(false);
            };

            getSubs.done(success, fail);
        };

        //#endregion

        /**
        The page's id.
        */
        static get PageId()
        {
            return "Login";
        };

        /** 
        The page's URL, relative from the app root.
        */
        static get PageUrl()
        {
            return "login/login.html";
        }

        /**
        Defines the controller's WinJS navigation functions.
        */
        static DefinePage()
        {
            WinJS.UI.Pages.define(LoginController.PageUrl, {
                init: (element, options) =>
                {

                },
                processed: (element, options) =>
                {

                },
                ready: (element, options) =>
                {
                    var client = new LoginController();

                    //Track the current page
                    Main.CurrentPage(LoginController.PageId);

                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);

                    ko.applyBindings(client, element);
                },
                error: (err) =>
                {
                    alert("Error loading LoginController.");
                }
            });
        }
    }
}