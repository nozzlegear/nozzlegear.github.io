/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="./../main.ts" />
/// <reference path="./../../../lib/custom/ConvertKitClient/ConvertKit.ts" />

namespace ConvertKit
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

        private Service: ConvertKit.SubscriberService;
        
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
            this.Service = new ConvertKit.SubscriberService(this.SecretKey());
            
            //Try to pull in subscribers. If it fails, API key was incorrect.
            var getSubs = this.Service.GetAsync();

            var success = (resp: ConvertKit.Entities.SubscriberList) =>
            {
                //Save the key in localstorage
                Utils.LocalStorage.Save(Strings.SecretKeyId, this.SecretKey());

                var state: Entities.HomeController.ExpectedState = {
                    SubscriberList: resp
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
