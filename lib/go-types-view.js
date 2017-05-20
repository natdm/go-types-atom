'use babel';
import ReactDOM from 'react-dom';
import React from 'react';
import View from './components';
import { NoGo, Error, UpgradeComponent, LoadingMessage } from './components/components';
const exec = require('child_process').exec;
const fs = require('fs');

export default class GoTypesView {
    constructor(serializedState) {
        // Create root element
        this.element = document.createElement('div');
        this.element.classList.add('go-types');
        if (this.execExists()) {
            console.log('found binary');
            this.start();
        } else {
            console.log('Go-typelist is not downloaded');
            ReactDOM.render(<LoadingMessage message={'Go getting code...'} />, this.element);
            this.getExec((err, res) => {
                if (err != null) {
                    console.error('error getting go-typelist: ', err);
                    ReactDOM.render(<Error error={'Error getting go-typelist'} />, this.element);
                    return;
                }
                ReactDOM.render(<LoadingMessage message={'Done Go Getting. Select your file again.'} />, this.element);
                console.log('Updated go-typelist');
                this.start();
            });
        }
    }

    start() {
        this.setListeners();
        this.parseFile();
    }

    execExists = () => {
        let stat;
        try {
            stat = fs.statSync(process.env.GOPATH + '/bin/go-typelist');
            return true;
        } catch (e) {
            return false;
        }
    };

    getExec = cb => {
        exec(`go get -u github.com/natdm/go-typelist/.../`, (err, stdout, stderr) => {
            if (err != null) {
                cb(err, null);
                return;
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
            if (editor.buffer === null || typeof editor.buffer === 'undefined') {
                return;
            }
            file = editor.buffer.file;

            if (file === null || typeof file === 'undefined') {
                return;
            }

            if (!file.path.endsWith('.go')) {
                ReactDOM.render(<NoGo />, this.element);
                return;
            }

            exec(`go-typelist ${file.path}`, (err, stdout, stderr) => {
                // stderr does not output null. Lame.
                if (stderr !== '') {
                    if (stderr.indexOf('command not found') > -1) {
                        ReactDOM.render(<Error error={'error finding go-typelist'} />, this.element);
                        return;
                    }
                }
                if (err !== null) {
                    console.error('could not open file', err);
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
    destroy() {
        this.element.remove();
    }

    getElement = () => this.element;
}
