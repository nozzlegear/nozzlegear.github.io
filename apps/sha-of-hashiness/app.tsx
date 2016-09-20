// Import the babel-polyfill at the top of the application
const polyfill = require("babel-polyfill");

// Material-UI needs the react-tap-event-plugin activated
const injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

// General imports
import * as SHA from "jssha"; 
import * as React from 'react';
import * as Dom from "react-dom";
import {
    AppBar, 
    SelectField, 
    MenuItem, 
    TextField, 
    RaisedButton, 
    TouchTapEvent, 
    Snackbar, 
    FlatButton,
    Toggle,
} from "material-ui";

// Styles
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
require("./css/theme.scss");

// Colors
const themeColor = "rgb(25,118,210)";

type Algorithm = "sha-1" | "sha-256" | "sha-512";

export interface IProps extends React.Props<any> {
    
}

export interface IState {
    algorithm?: Algorithm;
    result?: string;
    lastInput?: string;
    input?: string;
    toUpper?: boolean;
    successBarOpen?: boolean;
    errorBarOpen?: boolean;
}

export default class ShaOfHashiness extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        
        this.configureState(props, false);
    }
    
    public state: IState = {};
    
    //#region Utility functions
    
    private configureState(props: IProps, useSetState: boolean) {
        let state: IState = {
            algorithm: "sha-1",
            input: "",
            lastInput: "",
            toUpper: true,
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

    private hash(input: string, algorithm: Algorithm, toUpper: boolean) {
        if (!input) {
            return "";
        }

        //Hashes can only be updated once, so they must always create a new instance when hashing.
        let hasher: SHA;
        
        switch (algorithm) {
            default:
            case "sha-1":
                hasher = new SHA("SHA-1", "TEXT");
                break;
                
            case "sha-256":
                hasher = new SHA("SHA-256", "TEXT");
                break;
                
            case "sha-512":
                hasher = new SHA("SHA-512", "TEXT");
                break;
        }

        hasher.update(input);

        return hasher.getHash("HEX", {outputUpper: toUpper});
    }

    private handleHash(e?: TouchTapEvent | React.FormEvent<any>) {
        if (e) {
            e.preventDefault();
        }

        if (!this.state.input) {
            return;
        }

        const {input, algorithm, toUpper} = this.state;
        
        this.setState({input: "", lastInput: input, result: this.hash(input, algorithm, toUpper)});
    }

    private changeAlgorithm(e: TouchTapEvent, index: number, value: Algorithm) {
        this.setState({algorithm: value, result: this.hash(this.state.lastInput, value, this.state.toUpper)})
    }

    private toggle(e: TouchTapEvent) {
        const toUpper = !this.state.toUpper;

        this.setState({toUpper, result: this.hash(this.state.lastInput, this.state.algorithm, toUpper)})
    }

    private copyToClipboard(e: React.MouseEvent<any> | TouchTapEvent) {
        e.preventDefault();

        let success = true;
        const area = document.createElement("textarea");
        area.value = this.state.result;

        document.body.appendChild(area);

        try {
            area.select();
            document.execCommand("copy");

            this.setState({successBarOpen: true, errorBarOpen: false});
        }
        catch (e) {
            console.error("Error copying result to clipboard", e);

            success = false;
        }

        this.setState({errorBarOpen: !success, successBarOpen: success}, () => {
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

        let result: JSX.Element;

        if (this.state.result) {
            result = <FlatButton labelStyle={{"padding":"0", "textTransform":"none"}} label={this.state.result} onTouchTap={(e) => this.copyToClipboard(e)} />;
        }

        return (
            <MuiThemeProvider>
                <main id="sha-of-hashiness">
                    <AppBar title="Sha of Hashiness" style={{"backgroundColor": themeColor}} iconStyleLeft={{display: "none"} as any} />
                    <section id="controls">
                        <div id="top">
                            <div className="controls">
                                <SelectField className="algorithm-picker" fullWidth={true} value={this.state.algorithm} onChange={(e, i, v) => this.changeAlgorithm(e, i, v)}>
                                    <MenuItem value="sha-1" primaryText="SHA-1 Hash" />
                                    <MenuItem value="sha-256" primaryText="SHA-256 Hash" />
                                    <MenuItem value="sha-512" primaryText="SHA-512 Hash" />
                                </SelectField>
                                <Toggle className="upper-toggle" style={{width: "auto"}} label="Uppercase" labelPosition={"right"} toggled={this.state.toUpper} onToggle={(e) => this.toggle(e)} />
                            </div>
                            {result}
                        </div>
                        <form id="bottom" onSubmit={(e) => this.handleHash(e)}>
                            <TextField value={this.state.input} onChange={(e: React.FormEvent<HTMLInputElement>) => this.setState({input: e.target.value}) } hintText={"Text to hash"} className="input" underlineFocusStyle={{"borderColor": themeColor}} />
                            <RaisedButton type="submit" onTouchTap={(e) => this.handleHash(e)} label="Hash it" className="hash-button" labelColor={"#fff"} backgroundColor={themeColor} />
                        </form>
                    </section>
                    <Snackbar open={this.state.successBarOpen} message={"Copied to clipboard."} autoHideDuration={3000} onRequestClose={(e) => this.setState({successBarOpen: false})} />
                    <Snackbar open={this.state.errorBarOpen} message={"Could not copy result to clipboard."} autoHideDuration={3000} onRequestClose={(e) => this.setState({errorBarOpen: false})} />
                </main>
            </MuiThemeProvider>
        );
    }
}

{
    Dom.render(<ShaOfHashiness />, document.getElementById("contenthost"));
}