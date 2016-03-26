/// <reference path="./../../../typings/tsd.d.ts" />
var Utils;
(function (Utils) {
    //#region Storage 
    var LocalStorage;
    (function (LocalStorage) {
        function Save(key, value) {
            localStorage.setItem(key, value);
        }
        LocalStorage.Save = Save;
        ;
        function Retrieve(key) {
            return localStorage.getItem(key);
        }
        LocalStorage.Retrieve = Retrieve;
        ;
        function Delete(key) {
            localStorage.removeItem(key);
        }
        LocalStorage.Delete = Delete;
        ;
    })(LocalStorage = Utils.LocalStorage || (Utils.LocalStorage = {}));
    ;
    var SessionStorage;
    (function (SessionStorage) {
        function Save(key, value) {
            sessionStorage.setItem(key, value);
        }
        SessionStorage.Save = Save;
        ;
        function Retrieve(key) {
            return sessionStorage.getItem(key);
        }
        SessionStorage.Retrieve = Retrieve;
        ;
        function Delete(key) {
            sessionStorage.removeItem(key);
        }
        SessionStorage.Delete = Delete;
        ;
    })(SessionStorage = Utils.SessionStorage || (Utils.SessionStorage = {}));
    ;
    //#endregion
    function ShowDialog(title, message, buttonText, callback, withCancelCommand) {
        if (buttonText === void 0) { buttonText = "Okay"; }
        if (withCancelCommand === void 0) { withCancelCommand = false; }
        var div = document.createElement("div");
        var p = document.createElement("p");
        p.textContent = message;
        //Add the paragraph to the div element
        div.appendChild(p);
        var options = {
            title: title,
            primaryCommandText: buttonText,
            secondaryCommandDisabled: true
        };
        if (withCancelCommand) {
            options.secondaryCommandText = "Cancel",
                options.secondaryCommandDisabled = false;
        }
        ;
        var dialog = new WinJS.UI.ContentDialog(div, options);
        //Dispose the dialog after the user closes it.
        dialog.onafterhide = function (event) {
            dialog.dispose();
            if (callback) {
                callback(event);
            }
            ;
        };
        //Add the dialog to the body and show it
        document.body.appendChild(dialog.element);
        dialog.show();
    }
    Utils.ShowDialog = ShowDialog;
})(Utils || (Utils = {}));
