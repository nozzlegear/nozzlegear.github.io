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
            alert(message);
        }
        Utils.ShowDialog = ShowDialog;
    })(Utils = App.Utils || (App.Utils = {}));
})(App || (App = {}));
//# sourceMappingURL=utilities.js.map