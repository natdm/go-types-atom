"use babel";
import ReactDOM from "react-dom";
import React from "react";
import View from "./components";
import { NoGo, Error, UpgradeComponent } from "./components/components";
const exec = require("child_process").exec;
const fs = require("fs");

export default class GoTypes {
    constructor(serializedState) {
        // Create root element
        this.element = document.createElement("div");
        this.element.classList.add("go-types");
        let stat = null;
        ReactDOM.render(<Error error="before fsStat" />, this.element);
        try {
            stat = fs.statSync(process.env.GOPATH + "/bin/go-typelist");
        } catch (e) {
            ReactDOM.render(<Error error={"type-list does not exist"} />, this.element);
        }
        ReactDOM.render(<Error error={"Getting exec"} />, this.element);
        this.getExec(stat !== null, (err, res) => {
            if (err != null) {
                console.error("error getting go-typelist: ", err);
                ReactDOM.render(<Error error={"error getting go-typelist"} />, this.element);
                return;
            }
            console.log("Updated go-typelist");
            ReactDOM.render(<View version={null} entries={[]} />, this.element);
            this.setListeners();
        });
    }

    getExec = (exists, cb) => {
        if (exists) {
            console.log("go-typelist is downloaded.");
            cb(null, null);
            return;
        }
        console.log("go-typelist is not downloaded. Downloading.");
        exec(`go get -u github.com/natdm/go-typelist/.../`, (err, stdout, stderr) => {
            if (err != null) {
                return cb(err, null);
            }
            cb(null, stdout);
        });
    };

    setListeners() {
        // on each save..
        atom.workspace.observeTextEditors(editor => {
            editor.onDidSave(() => this.parseFile());
        });
        atom.workspace.onDidChangeActivePaneItem(pane => {
            // only update on text editors. If not, empty screens or undefined.
            if (typeof atom.workspace.getActiveTextEditor != undefined) {
                this.parseFile();
                return;
            }
        });
    }

    parseFile() {
        let editor, file;
        let entries = null;
        if ((editor = atom.workspace.getActivePaneItem())) {
            if (editor.buffer === null || typeof editor.buffer === "undefined") {
                return;
            }
            file = editor.buffer.file;

            if (file === null || typeof file === "undefined") {
                return;
            }

            if (!file.path.endsWith(".go")) {
                ReactDOM.render(<NoGo />, this.element);
                return;
            }

            exec(`go-typelist ${file.path}`, (err, stdout, stderr) => {
                // stderr does not output null. Lame.
                if (stderr !== "") {
                    if (stderr.indexOf("command not found") > -1) {
                        // TODO: Install for them?
                        const errMsg =
                            "Install Go Typelist with 'go get github.com/natdm/go-typelist' and then 'go install'";
                        ReactDOM.render(<Error error={errMsg} />, this.options.item);
                        return;
                    }
                }
                if (err !== null) {
                    console.error("could not open file", err);
                    ReactDOM.render(<Error error={JSON.stringify(err)} />, this.element);
                    return;
                }
                try {
                    entries = JSON.parse(stdout);
                } catch (err) {
                    console.error(err);
                    ReactDOM.render(<Error error={JSON.stringify(err)} />, this.element);
                    return;
                }

                ReactDOM.render(<View version={entries.version} entries={entries.objects} />, this.element);
            });
        }
    }

    // Used by Atom for tab text
    getTitle = () => "Go Types";

    // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
    // Valid values are "left", "right", "bottom", and "center" (the default).
    getDefaultLocation = () => "right";

    // The locations into which the item can be moved.
    getAllowedLocations = () => ["left", "right", "bottom"];

    // Used by Atom to identify the view when toggling.
    getURI = () => "atom://go-types";

    // Returns an object that can be retrieved when package is activated
    serialize = () => ({ deserializer: "go-types/GoTypes" });

    // Tear down any state and detach
    destroy() {
        this.element.remove();
    }

    getElement = () => this.element;
}
