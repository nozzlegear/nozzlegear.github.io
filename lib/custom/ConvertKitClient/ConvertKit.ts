/// <reference path="../../../typings/tsd.d.ts" />

namespace ConvertKit
{
    /**
    A generic ConvertKit service, used by all other services. You should not be using this directly.
    */
    class _Service
    {
        constructor(public _SecretKey)
        {

        }

        /**
        The base URL for all requests.
        */
        private get _BaseUrl(): string { return "https://api.convertkit.com/v3/" };

        //#region Utility functions
        
        /**
        Builds headers for a request, including the Content-Type and Accept headers.
        */
        protected BuildRequestHeaders(contentType: string, extraHeaders: Object = {})
        {
            var headers = _.extend({
                "Content-Type": contentType,
                "Accept": "application/json"
            }, extraHeaders);
            
            return headers;
        };
        
        /**
        Creates a webrequest to the given path and appends the client's SecretKey.
        */
        protected CreateRequest<T>(method: string, path: string, data?: Object)
        {
            var req = reqwest<T>({
                url: this._BaseUrl + path + '?api_secret=' + this._SecretKey,
                method: method,
                data: data && JSON.stringify(data) || null,
                headers: this.BuildRequestHeaders("application/json"),
                contentType: "application/json"
            });
            
            return req
        };
        
        /**
        * Finishes a web request and automatically resolves or rejects it. Pass an optional callback to receive the 
        * response's string content and the promise resolver.
        * @param message The web request method.
        * @param resolve The promise resolver.
        * @param reject The promise rejecter.
        * @param callback Optional callback. Receives the response's string content. Promise resolver will not be called when this callback is used.
        */
        protected FinishRequest<T>(req: Reqwest.ReqwestPromise<T>, resolve, reject, callback: (content: T) => void = null)
        {
            req.fail(reject);

            req.then((resp) =>
            {
                if (req.request.status > 205 || req.request.status < 200)
                {
                    reject(`Response for request did not indicate success. Status code: ${req.request.status}.`);

                    return;
                };

                if (!callback)
                {
                    resolve(resp);

                    return;
                }

                callback(resp);
            });
        };

        //#endregion
    }

    /**
    A service for interacting with ConvertKit subscribers.
    */
    export class SubscriberService extends _Service
    {
        constructor(secretKey)
        {
            super(secretKey);
        }

        /**
        Retrieves a list of the user's ConvertKit subscribers.
        */
        public GetAsync = (page: number = 1) =>
        {
            return new WinJS.Promise<Entities.SubscriberList>((resolve, reject) =>
            {
                var message = this.CreateRequest("GET", "subscribers");

                this.FinishRequest(message, resolve, reject);
            });
        };
    }

    /**
    A service for interacting with ConvertKit forms.
    */
    export class FormService extends _Service
    {
        constructor(secretKey)
        {
            super(secretKey);
        }

        /**
        Retrieves a list of the user's ConvertKit forms.
        */
        public GetAsync = (page: number = 1) =>
        {
            return new WinJS.Promise<Entities.FormResponse>((resolve, reject) =>
            {
                var message = this.CreateRequest("GET", "forms");
                
                this.FinishRequest(message, resolve, reject);
            });
        };
    }
}