'use babel';
import ReactDOM from 'react-dom';
import React from 'react';
import View from './components';
import { NoGo, Error, UpgradeComponent } from './components/components';
const exec = require('child_process').exec;

export default class GoTypes {
    constructor(serializedState) {
        // Create root element
        this.element = document.createElement('div');
        this.element.classList.add('go-types');

        ReactDOM.render(<View entries={[]} />, this.element);
        this.setListeners();
    }

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
                        // TODO: Install for them?
                        const errMsg = "Install Go Typelist with 'go get github.com/natdm/go-typelist' and then 'go install'";
                        ReactDOM.render(<Error error={errMsg} />, this.options.item);
                        return;
                    }
                }
                if (err != null) {
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

    getTitle() {
        // Used by Atom for tab text
        return 'Go Types';
    }

    getDefaultLocation() {
        // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
        // Valid values are "left", "right", "bottom", and "center" (the default).
        return 'right';
    }

    getAllowedLocations() {
        // The locations into which the item can be moved.
        return ['left', 'right', 'bottom'];
    }

    getURI() {
        // Used by Atom to identify the view when toggling.
        return 'atom://go-types';
    }

    // Returns an object that can be retrieved when package is activated
    serialize() {
        return {
            deserializer: 'go-types/GoTypes',
        };
    }

    // Tear down any state and detach
    destroy() {
        this.element.remove();
        this.subscriptions.dispose();
    }

    getElement() {
        return this.element;
    }
}
