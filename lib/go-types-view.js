'use babel';
import ReactDOM from 'react-dom';
import React from 'react';
import View from './components';
import { NoGo, Error, LoadingMessage } from './components/components';
const exec = require('child_process').exec;
const fs = require('fs');

// the compatible version of go-typelist
const compatibleVersion = '0.0.3';

export default class GoTypesView {
    constructor(serializedState) {
        // Create root element
        this.element = document.createElement('div');
        this.element.classList.add('go-types');

        // check for updates to binary.
        if (this.execExists()) {
            exec(`go-typelist -v`, (err, stdout, stderr) => {
                if (err !== null) this.render(<Error error={'Error checking go-typelist version. Attempting to update'} />);

                if (err !== null || stdout.trim() !== compatibleVersion.trim()) {
                    this.getExec((err, res) => {
                        if (err !== null) {
                            const errMsg =
                                'Error getting go-typelist Please run `go get -u github.com/natdm/go-typelist/.../` to get and install the most recent version of the go-typelist parser.';
                            this.render(<Error error={errMsg} />, null, null, 'error updating go-typelist: ' + err);
                            return;
                        }
                        this.render(<LoadingMessage message={'Done updating. Select your file again.'} />, 'Updated go-typelist');
                    });
                }
                this.start();
                return;
            });
        }
        this.render(<LoadingMessage message={'Go getting code...'} />);
        this.getExec((err, res) => {
            if (err !== null) {
                this.render(<Error error={'Error getting go-typelist'} />, null, null, 'error getting go-typelist: ' + err);
                return;
            }
            this.render(<LoadingMessage message={'Done Go Getting. Select your file again.'} />, 'Updated go-typelist');
            this.start();
        });
    }

    // render can render a component and optionally log messages
    render = (component, info, warn, error) => {
        if (info) console.log(info);
        if (warn) console.warn(warn);
        if (error) console.error(error);
        ReactDOM.render(component, this.element);
    };

    start = () => {
        this.setListeners();
        this.parseFile();
    };

    execExists = () => {
        let stat;
        try {
            stat = fs.statSync(process.env.GOPATH + '/bin/go-typelist');
            return true;
        } catch (e) {
            return false;
        }
    };

    // attempt to get/update and return an error if any. Else, return stdout
    getExec = cb => exec(`go get -u github.com/natdm/go-typelist/.../`, (err, stdout, stderr) => (err !== null ? cb(err, null) : cb(null, stdout)));

    setListeners = () => {
        // on each save, parse the file.
        atom.workspace.observeTextEditors(editor => editor.onDidSave(() => this.parseFile()));

        // on each pane change, parse the file.
        atom.workspace.onDidChangeActivePaneItem(pane => (typeof atom.workspace.getActiveTextEditor != undefined ? this.parseFile() : null));
    };

    parseFile = () => {
        let editor, file;
        let entries = null;
        if ((editor = atom.workspace.getActivePaneItem())) {
            if (editor.buffer === null || typeof editor.buffer === 'undefined') {
                // when they click within GoTypes column
                return;
            }

            file = editor.buffer.file;
            if (file === null || typeof file === 'undefined') {
                this.render(<View entries={[]} />);
                return;
            }

            if (!file.path.endsWith('.go')) {
                this.render(<View entries={[]} />);
                return;
            }

            exec(`go-typelist ${file.path}`, (err, stdout, stderr) => {
                // stderr does not output null. Lame.
                if (stderr !== '') {
                    if (stderr.indexOf('command not found') > -1) {
                        this.render(<Error error={'error finding go-typelist'} />);
                        return;
                    }
                }
                if (err !== null) {
                    this.render(<Error error={JSON.stringify(err)} />, null, null, 'could not open file' + err);
                    return;
                }
                try {
                    entries = JSON.parse(stdout);
                } catch (err) {
                    this.render(<Error error={JSON.stringify(err)} />, null, null, err);
                    return;
                }

                this.render(<View entries={entries.objects} />);
            });
        }
    };

    // Used by Atom for tab text
    getTitle = () => 'Go Types';

    // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
    // Valid values are "left", "right", "bottom", and "center" (the default).
    getDefaultLocation = () => 'right';

    // The locations into which the item can be moved.
    getAllowedLocations = () => ['left', 'right', 'bottom'];

    // Used by Atom to identify the view when toggling.
    getURI = () => 'atom://go-types';

    // Returns an object that can be retrieved when package is activated
    serialize = () => ({ deserializer: 'go-types/GoTypes' });

    // Tear down any state and detach
    destroy = () => this.element.remove();

    getElement = () => this.element;
}
