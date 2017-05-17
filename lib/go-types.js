'use babel';

import View from './go-types-view';
import { CompositeDisposable } from 'atom';
import { Loading, UpdateComponent, Error, NoGo } from './components';
import React from 'react';
import ReactDOM from 'react-dom';
const exec = require('child_process').exec;

const currentVersion = '0.0.1';

export default {
    options: {
        item: document.createElement('div'),
        visible: false,
        name: 'go-types-panel',
    },

    activate(state) {
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();
        this.rightPanel = atom.workspace.addRightPanel(this.options);
        this.gutter = null;

        // Register command that toggles this view
        this.subscriptions.add(
            atom.commands.add('atom-workspace', {
                'go-types:toggle': () => this.toggle(),
            }),
        );
        this.parseFile();
        this.setListeners();
    },

    deactivate() {
        this.rightPanel.destroy();
        this.subscriptions.dispose();
        this.gutter.destroy();
    },

    serialize() {
        return {};
    },

    setListeners() {
        atom.workspace.observeTextEditors(editor => {
            editor.onDidSave(arg => this.parseFile());
            editor.addGutter({ name: 'go-types-gutteradsf', visible: true });
        });
        atom.workspace.onDidStopChangingActivePaneItem(editor => this.parseFile());
    },

    parseFile() {
        let editor;
        let file;
        let entries = null;
        if ((editor = atom.workspace.getActivePaneItem())) {
            if (editor.buffer === null || typeof editor.buffer === 'undefined') {
                console.error('editor buffer null or undefined');
                ReactDOM.render(<View entries={[]} />, this.options.item);
                return;
            }
            file = editor.buffer.file;

            if (file === null || typeof file === 'undefined') {
                console.error('file is null or undefined');
                ReactDOM.render(<View entries={[]} />, this.options.item);
                return;
            }

            if (!file.path.endsWith('.go')) {
                console.error('not a go file');
                ReactDOM.render(<NoGo />, this.options.item);
                return;
            }

            exec(`goparsetypes ${file.path}`, (err, stdout, stderr) => {
                if (err != null) {
                    console.error('could not open file', err);
                    ReactDOM.render(<Error error={JSON.stringify(err)} />, this.options.item);
                    return;
                }
                try {
                    entries = JSON.parse(stdout);
                } catch (err) {
                    console.error(err);
                    ReactDOM.render(<Error error={JSON.stringify(err)} />, this.options.item);
                    return;
                }

                if (entries.version !== currentVersion) {
                    ReactDOM.render(<UpgradeComponent />, this.options.item);
                    return;
                }
                ReactDOM.render(<View entries={entries.objects} />, this.options.item);
            });
        }
    },

    toggle() {
        return this.rightPanel.isVisible() ? this.rightPanel.hide() : this.rightPanel.show();
    },
};
