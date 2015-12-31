/// <reference path="lib/blueimp-md5/md5.js" />
/*global module */
module.exports = function (grunt)
{
    'use strict';

    grunt.initConfig({
        bom: {
            addBom: {
                src: ["apps/**/*.js", "apps/**/*.css", "lib/**/*.js", "lib/**/*.css"],
                options: {
                    add: true
                }
            }
        },
        bower: {
            install: {
                options: {
                    targetDir: "lib",
                    layout: "byComponent"
                }
            }
        },
        less: {
            stages: {
                options: {
                    sourceMap: false
                },
                files: {
                    "apps/stages/app.css": "apps/stages/app.less",
                    "apps/stages/financials/financials.css": "apps/stages/financials/financials.less",
                    "apps/stages/subscribers/subscribers.css": "apps/stages/subscribers/subscribers.less",
                    "apps/stages/settings/settings.css": "apps/stages/settings/settings.less",
                    "apps/stages/login/login.css":"apps/stages/login/login.less"
                }
            },
            ck:{
                options: {
                    sourceMap: false
                },
                files:{
                    "apps/convertkit/app.css": "apps/convertkit/app.less",
                    "apps/convertkit/forms/forms.css":"apps/convertkit/forms/forms.less",
                    "apps/convertkit/home/home.css":"apps/convertkit/home/home.less",
                    "apps/convertkit/login/login.css":"apps/convertkit/login/login.less",
                    "apps/convertkit/settings/settings.css":"apps/convertkit/settings/settings.less"
                }
            }
        },
        uglify: {
            options: {
                mangle: true,
                sourceMap: true
            },
            libs: {
                files: {
                    "lib/libs.min.js": [
                        "lib/blueimp-md5/md5.js",
                        "lib/lodash/lodash.js",
                        "lib/moment/moment.js",
                        "lib/reqwest/reqwest.js",
                        "lib/winjs/js/base.js",
                        "lib/winjs/js/ui.js",
                        "lib/custom/navigator.js",
                        "lib/knockout/knockout.js",
                        "lib/knockout-winjs/knockout-winjs.js",
                        "lib/custom/knockout.stopbinding/knockout.stopbinding.js",
                        "lib/custom/utilities/utilities.js"
                    ]
                }
            },
            stages: {
                files: {
                    "apps/stages/app.min.js": [
                        "lib/custom/stagesclient/stagesclient.js",
                        "apps/stages/login/logincontroller.js",
                        "apps/stages/financials/financialcontroller.js",
                        "apps/stages/subscribers/subscribercontroller.js",
                        "apps/stages/settings/settingscontroller.js",
                        "apps/stages/main.js"
                    ]
                }
            },
            ck:{
                files:{
                    "apps/convertkit/app.min.js":[
                        "lib/custom/convertkitclient/convertkit.js",
                        "apps/convertkit/login/logincontroller.js",
                        "apps/convertkit/forms/formscontroller.js",
                        "apps/convertkit/home/homecontroller.js",
                        "apps/convertkit/settings/settingscontroller.js",
                        "apps/convertkit/main.js"
                    ]
                }
            }
        },
        cssmin: {
            options: {
                sourceMap:true
            },
            apps: {
                files: [{
                    expand: true,
                    src: ['apps/**/*.css', '!apps/**/*.min.css'],
                    ext: '.min.css'
                }]
            }
        },
        typescript: {
            apps: {
                src: ["apps/**/*.ts"],
                options: {
                    target: "es5",
                    sourceMap: true,
                    removeComments: true
                }
            },
            libs: {
                src: ["lib/custom/**/*.ts", "lib/custom/*.ts"],
                options: {
                    target: "es5",
                    sourceMap: true,
                    removeComments: true
                }
            }
        }
    });

    // Add all plugins that your project needs here
    grunt.loadNpmTasks('grunt-byte-order-mark');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-typescript');

    //Register named tasks
    grunt.registerTask('addBom', ['bom:addBom']);
    grunt.registerTask("build", ["typescript", "less", "uglify", "cssmin", "bom"])

    // define the default task that can be run just by typing "grunt" on the command line
    grunt.registerTask('default', []);
};