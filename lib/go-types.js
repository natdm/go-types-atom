'use babel';

import View from './go-types-view';
import { CompositeDisposable, Disposable } from 'atom';
import { Loading, Error, NoGo } from './components';

export default {
    subscriptions: null,
    activate(state) {
        this.subscriptions = new CompositeDisposable(
            // Add an opener for our view.
            atom.workspace.addOpener(uri => {
                if (uri === 'atom://go-types') {
                    return new View();
                }
            }),
            // Register command that toggles this view
            atom.commands.add('atom-workspace', {
                'go-types:toggle': () => this.toggle(),
            }),
            // Destroy any ActiveEditorInfoViews when the package is deactivated.
            new Disposable(() => {
                atom.workspace.getPaneItems().forEach(item => {
                    if (item instanceof View) {
                        item.destroy();
                    }
                });
            }),
        );
    },

    deactivate() {
        this.subscriptions.dispose();
    },

    toggle() {
        atom.workspace.toggle('atom://go-types');
    },

    deserializeActiveEditorInfoView(serialized) {
        return new View();
    },
};
