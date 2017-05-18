'use babel';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { UpgradeComponent } from './components';

const compatibleVersion = '0.0.1';

export default class View extends Component {
    constructor(p) {
        super(p);
        this.state = { byLine: true };
    }

    navToItem(line) {
        atom.workspace.getCenter().observeActivePaneItem(item => {
            if (typeof item === undefined || item === null) {
                return;
            }
            item.setCursorScreenPosition([line - 1, 0]);
        });
    }

    stylize(entry) {
        const { signature, name, type, receiver, has_parent } = entry;

        const _syntaxSrc = 'syntax--source syntax--go';
        const _keyWord = 'syntax--keyword syntax--type syntax--go';
        const _fn = 'syntax--entity syntax--name syntax--function syntax--go';
        const _typeName = 'syntax--entity syntax--name syntax--type syntax--go';
        const _struct = 'syntax--keyword syntax--struct syntax--go';
        const _string = 'syntax--storage syntax--type syntax--string syntax--go';
        const _num = 'syntax--storage syntax--type syntax--numeric syntax--go';
        const _interface = 'syntax--keyword syntax--interface syntax--go';
        const _variable = 'syntax--variable syntax--other syntax--assignment syntax--go';

        let out = signature;

        out = out
            // .replace(/func/, `<span class="${_keyWord}">func </span>`)
            // .replace(/struct/, `<span class="${_keyWord}">struct</span>`)
            // .replace(/int/, `<span class=${_keyWord}>int</span>`)

            // .replace(/type/, `<span class="${_keyWord}">type</span>`)
            // .replace(/const/, `<span class="${_keyWord}">const</span>`)
            // .replace(/var/, `<span class="${_keyWord}">var</span>`)

            .replace(/interface/, `<span class="${_interface}">interface</span>`)
            .replace(/string/, `<span class="${_keyWord}">string</span>`)
            .replace(/int32/, `<span class="${_keyWord}">int32</span>`)
            .replace(/int64/, `<span class="${_keyWord}">int64</span>`)
            .replace(/uint/, `<span class="${_keyWord}">uint</span>`)
            .replace(/uint32/, `<span class="${_keyWord}">uint32</span>`)
            .replace(/uint64/, `<span class="${_keyWord}">uint64</span>`)
            .replace(/float32/, `<span class="${_keyWord}">float32</span>`)
            .replace(/float64/, `<span class="${_keyWord}">float64</span>`)
            .replace(/map/, `<span class="${_keyWord}">map</span>`)
            .replace(/array/, `<span class="${_keyWord}">array</span>`)
            .replace(/slice/, `<span class="${_keyWord}">slice</span>`)
            .replace(/byte/, `<span class="${_keyWord}">byte</span>`)
            .replace(/bool/, `<span class="${_keyWord}">bool</span>`)
            .replace(/uintptr/, `<span class="${_keyWord}">uintptr</span>`)
            .replace(/chan/, `<span class="${_keyWord}">chan</span>`)
            .replace(/complex64/, `<span class="${_keyWord}">complex64</span>`)
            .replace(/error/, `<span class="${_keyWord}">error</span>`)
            .replace(/complex128/, `<span class="${_keyWord}">complex128</span>`);

        // if a method and the parent type is in this file, group by method
        if (receiver != null && has_parent && !this.state.byLine) {
            // if a pointer receiver, do something fancier.
            receiver.pointer
                ? (out = out.replace(`func (${receiver.alias} *${receiver.type_name})`, '&nbsp;&nbsp;&#9507'))
                : (out = out.replace(`func (${receiver.alias} ${receiver.type_name})`, '&nbsp;&nbsp;&#9501'));
        }

        if (out.split(' ')[0] == 'func') {
            out = out.replace('func ', `<span class="${_keyWord}">func</span> `);
        }
        if (out.indexOf('struct') > -1 && out.indexOf('type') > -1) {
            out = out.replace('struct', `<span class="${_keyWord}">struct</span>`);
        }
        if (out.indexOf(']int') > -1 || out.indexOf('(int') > -1 || out.indexOf('int)') > -1) {
            out = out.replace('int', `<span class="${_keyWord}">int</span>`);
        }
        if (out.indexOf('struct {') > -1) {
            out = out.replace('struct {', `<span class="${_keyWord}">struct</span> {`);
        }

        if (name != null) {
            switch (type) {
                case 'GenDecl':
                    const sigSplit = signature.split(' ');
                    switch (sigSplit[0]) {
                        case 'type':
                            out = `<span class="${_keyWord}">${sigSplit[0]}</span> <span class="${_typeName}">${sigSplit[1]}</span>`;
                            break;
                        default:
                            out = `<span class="${_keyWord}">${sigSplit[0]}</span> <span class="${_variable}">${sigSplit[1]}</span>`;
                    }
                    break;
                default:
                    out = out.replace(name, `<span class="${_fn}">${name}</span>`);
            }
        }

        return out;
    }

    sort(entries) {
        if (this.state.byLine) {
            return entries.sort((a, b) => a.line - b.line);
        }

        // group methods by type name
        let methods = {};

        // group methods with types while still preserving line numbers for all non-methods
        // and remove methods from the original.
        return (
            entries
                // Remove methods from entries and add to methods[receiver.type_name]
                .reduce((prev, curr, idx, arr) => {
                    // if not a method, add it.
                    if (curr.receiver === null) {
                        return [...prev, { ...curr, has_parent: false }];
                    }

                    // if is a method, but has no parent.. add it and return
                    if (typeof arr.find(typ => typ.name === curr.receiver.type_name) === 'undefined') {
                        return [...prev, { ...curr, has_parent: false }];
                    }

                    // if method has parent in file, add to methods object above and do not return that method
                    const currWithP = { ...curr, has_parent: true };
                    methods.hasOwnProperty(curr.receiver.type_name)
                        ? (methods[curr.receiver.type_name] = [...methods[curr.receiver.type_name], currWithP])
                        : (methods[curr.receiver.type_name] = [currWithP]);

                    return prev;
                }, [])
                // sort parent types to preserve lines
                .sort((a, b) => a.line - b.line)
                // add methods back in
                .reduce(
                    (prev, curr) =>
                        methods.hasOwnProperty(curr.name) ? [...prev, curr, ...methods[curr.name].sort((a, b) => a.line - b.line)] : [...prev, curr],
                    [],
                )
        );
    }

    toggleSort() {
        this.setState({ byLine: !this.state.byLine });
    }

    render() {
        const containerStyle = {
            height: '100%',
            overflowY: 'auto',
            paddingTop: '1.3em',
        };
        const headerWrapperStyle = {
            position: 'absolute',
            top: 0,
            width: '100%',
            height: '1em',
            backgroundColor: '#21252b',
            zIndex: 2,
        };
        const headerContainerStyle = { backgroundColor: '#21252b' };
        const headerTextStyle = {
            fontWeight: 600,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
        };
        const htmlSpanStyle = { lineHeight: 1.7, fontSize: '1.1em' };
        const lineNumStyle = {
            color: 'rgba(255,255,255,.2)',
            display: 'block',
            float: 'left',
            width: '2.5em',
            position: 'relative',
        };
        const buttonStyle = {
            ...asText,
            color: 'orange',
            marginLeft: '.5em',
        };
        const ulStyle = { zIndex: 0, listStyleType: 'none', paddingLeft: '0', marginTop: '.5em' };
        const liStyle = {
            paddingLeft: '.5em',
            lineHeight: '1.9em',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            alignItems: 'stretch',
            position: 'relative',
        };
        const asText = { background: 'none', border: 'none', margin: 0 };
        const lineItemBtn = { position: 'absolute' };

        if (this.props.version != compatibleVersion) {
            return <UpgradeComponent />;
        }
        return (
            <div style={containerStyle}>
                <div style={headerWrapperStyle}>
                    <div style={headerContainerStyle}>
                        <span style={headerTextStyle}>
                            {!this.state.byLine ? 'Grouped by Type.' : 'Sorted by Line.'}
                            <button style={{ ...buttonStyle, ...asText }} onClick={() => this.toggleSort()}>
                                Switch
                            </button>
                        </span>
                    </div>
                </div>
                <div>
                    <ul style={ulStyle}>
                        {this.sort(this.props.entries).map((e, i) => (
                            <li key={i} style={liStyle} onMouseEnter={() => {}} /* eventually make this change the background color */>
                                <span style={lineNumStyle}>{`${e.line}:`}</span>
                                <button style={{ ...asText, ...lineItemBtn }} onClick={() => this.navToItem(e.line)}>
                                    <span style={htmlSpanStyle} className="syntax--source syntax--go" dangerouslySetInnerHTML={{ __html: this.stylize(e) }} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}

View.propTypes = {
    entries: PropTypes.arrayOf(
        PropTypes.shape({
            line: PropTypes.number,
            signature: PropTypes.string,
            type: PropTypes.number,
            name: PropTypes.number,
            receiver: PropTypes.shape({
                type_name: PropTypes.string,
                pointer: PropTypes.bool,
                alias: PropTypes.string,
            }),
        }),
    ),
};
