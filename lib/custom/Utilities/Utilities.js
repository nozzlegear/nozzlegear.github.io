var App;
(function (App) {
    var Utils;
    (function (Utils) {
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
        function ShowDialog(title, message) {
            var div = document.createElement("div");
            var p = document.createElement("p");
            p.innerText = message;
            div.appendChild(p);
            var dialog = new WinJS.UI.ContentDialog(div, { title: title, primaryCommandText: "Okay" });
            dialog.onafterhide = function (event) {
                dialog.dispose();
            };
            document.body.appendChild(dialog.element);
            dialog.show();
        }
        Utils.ShowDialog = ShowDialog;
    })(Utils = App.Utils || (App.Utils = {}));
})(App || (App = {}));
//# sourceMappingURL=utilities.js.map