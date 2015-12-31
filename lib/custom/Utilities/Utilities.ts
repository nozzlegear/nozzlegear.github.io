/// <reference path="./../../../typings/tsd.d.ts" />

namespace Utils
{
    //#region Storage 

    export module LocalStorage
    {
        export function Save(key: string, value: any)
        {
            localStorage.setItem(key, value);
        };

        export function Retrieve(key: string)
        {
            return localStorage.getItem(key);
        };

        export function Delete(key: string)
        {
            localStorage.removeItem(key);
        };
    };

    export module SessionStorage
    {
        export function Save(key: string, value: any)
        {
            sessionStorage.setItem(key, value);
        };

        export function Retrieve(key: string)
        {
            return sessionStorage.getItem(key);
        };

        export function Delete(key: string)
        {
            sessionStorage.removeItem(key);
        };
    };

    //#endregion

    export function ShowDialog(title: string, message: string, buttonText: string = "Okay", callback?: (event) => void, withCancelCommand = false)
    {
        var div = document.createElement("div");
        var p = document.createElement("p");
        p.textContent = message;

        //Add the paragraph to the div element
        div.appendChild(p);

        var options: WinJS.UI.ContentDialogOptions = {
            title: title,
            primaryCommandText: buttonText,
            secondaryCommandDisabled: true
        };

        if (withCancelCommand)
        {
            options.secondaryCommandText = "Cancel",
                options.secondaryCommandDisabled = false
        };

        var dialog = new WinJS.UI.ContentDialog(div, options);

        //Dispose the dialog after the user closes it.
        dialog.onafterhide = (event) =>
        {
            dialog.dispose();

            if (callback)
            {
                callback(event);
            };
        };

        //Add the dialog to the body and show it
        document.body.appendChild(dialog.element);
        dialog.show();
    }
}
