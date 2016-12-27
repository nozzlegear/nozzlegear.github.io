// Material-UI needs the react-tap-event-plugin activated
const injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

// General imports
import { AutoPropComponent } from "auto-prop-component";
import * as React from 'react';
import inspect from "logspect";
import * as Dom from "react-dom";
import * as Crypto from "crypto-js";
import {
    AppBar,
    TextField,
    RaisedButton,
    TouchTapEvent,
    Snackbar,
    SelectField,
    MenuItem,
    FlatButton,
    Dialog,
} from "material-ui";

// Material UI
import * as colors from "material-ui/styles/colors";
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

export const theme = getMuiTheme(baseTheme, {
    appBar: {
        color: colors.teal600,
    },
    raisedButton: {
        primaryColor: colors.teal600,
        color: "#ffffff"
    }
});

export interface IProps extends React.Props<any> {

}

export interface IState {
    username?: string;
    password?: string;
    domain?: string;
    output?: "base64" | "hex";
    dialogOpen?: boolean;
    successBarOpen?: boolean;
    errorBarOpen?: boolean;
}

export default class ShaOfHashiness extends AutoPropComponent<IProps, IState> {
    constructor(props: IProps, context) {
        super(props, context);

        this.configureState(props, false);
    }

    public state: IState = {};

    //#region Utility functions

    private configureState(props: IProps, useSetState: boolean) {
        let state: IState = {
            username: "",
            password: "",
            domain: "",
            output: "hex",
            dialogOpen: false,
            successBarOpen: false,
            errorBarOpen: false,
        }

        if (!useSetState) {
            this.state = state;

            return;
        }

        this.setState(state);
    }

    //#endregion

    private resultField: TextField;

    private hash(input: string, secretKey: string, output: "base64" | "hex") {
        let hash = Crypto.HmacSHA256(input.toLowerCase(), secretKey);

        if (output === "base64") {
            hash = Crypto.enc.Base64.stringify(hash);
        }

        return hash.toString();
    }

    private handleHash(e?: TouchTapEvent | React.FormEvent<any>) {
        if (e) {
            e.preventDefault();
        }

        const { domain, password, username } = this.state;
        const hash = this.hash(`${username}@${domain}`, password, this.state.output);

        let success = true;
        const area = document.createElement("textarea");
        area.value = hash;

        document.body.appendChild(area);

        try {
            area.select();
            document.execCommand("copy");
        }
        catch (e) {
            inspect("Error copying result to clipboard", e);

            success = false;
        }

        this.setState({ errorBarOpen: !success, successBarOpen: success, password: "" }, () => {
            document.body.removeChild(area);
        });
    }

    public componentDidMount() {

    }

    public componentDidUpdate() {

    }

    public componentWillReceiveProps(props: IProps) {
        this.configureState(props, true);
    }

    public render() {
        let dialog;

        if (this.state.dialogOpen) {
            dialog = (
                <Dialog
                    title={"About"}
                    open={true}
                    modal={true}
                    autoScrollBodyContent={true}
                    actions={[<FlatButton key="close-button" label={"Close"} onTouchTap={e => this.setState({ dialogOpen: false })} />]}
                    onRequestClose={e => this.setState({ dialogOpen: false })}>
                    <p>
                        {"This tool calculates a unique password by running "}
                        <strong>{"'username@domain' "}</strong>
                        {"(to lower case) through an HMAC-SHA256 hash salted with your master password. As long as you know your username and your master password, you'll always generate the same unique, strong password for any website, with no need to manage password databases."}
                    </p>
                </Dialog>
            )
        }

        return (
            <MuiThemeProvider muiTheme={theme}>
                <main id="app">
                    <AppBar
                        title="Password Generator"
                        iconStyleLeft={{ display: "none" } as any}
                        iconElementRight={<FlatButton label="About" />}
                        onRightIconButtonTouchTap={e => this.setState({ dialogOpen: true })} />
                    {dialog}
                    <section id="controls">
                        <div id="top">
                            <div>
                                <SelectField
                                    fullWidth={true}
                                    floatingLabelText={"Output Type"}
                                    value={this.state.output}
                                    onChange={(e, i, v) => this.transformState(s => s.output = v)}>
                                    <MenuItem value={"hex"} primaryText={"Hex"} />
                                    <MenuItem value={"base64"} primaryText={"Base64"} />
                                </SelectField>
                                <TextField
                                    fullWidth={true}
                                    floatingLabelText="Username"
                                    value={this.state.username}
                                    onChange={this.updateStateFromEvent((s, v) => s.username = v)} />
                                <TextField
                                    fullWidth={true}
                                    floatingLabelText="Domain"
                                    value={this.state.domain}
                                    onChange={this.updateStateFromEvent((s, v) => s.domain = v)} />
                                <TextField
                                    fullWidth={true}
                                    floatingLabelText="Master Password"
                                    value={this.state.password}
                                    onChange={this.updateStateFromEvent((s, v) => s.password = v)}
                                    type="password" />
                            </div>
                        </div>
                        <form id="bottom">
                            <RaisedButton
                                primary={true}
                                fullWidth={true}
                                onTouchTap={(e) => this.handleHash(e)}
                                label="Generate" />
                        </form>
                    </section>
                    <Snackbar open={this.state.successBarOpen} message={"Copied to clipboard."} autoHideDuration={7000} onRequestClose={(e) => this.setState({ successBarOpen: false })} />
                    <Snackbar open={this.state.errorBarOpen} message={"Could not copy result to clipboard."} autoHideDuration={7000} onRequestClose={(e) => this.setState({ errorBarOpen: false })} />
                </main>
            </MuiThemeProvider>
        );
    }
}

{
    Dom.render(<ShaOfHashiness />, document.getElementById("contenthost"));
}