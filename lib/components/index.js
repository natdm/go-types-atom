'use babel';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Tabs } from './components';

const groupMethodsWithTypes = entries => {
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
                (prev, curr) => (methods.hasOwnProperty(curr.name) ? [...prev, curr, ...methods[curr.name].sort((a, b) => a.line - b.line)] : [...prev, curr]),
                [],
            )
    );
};

export default class View extends Component {
    constructor(p) {
        super(p);
        this.state = { byLine: true };
    }

    navToItem(line) {
        atom.workspace.getCenter().observeActivePaneItem(item => {
            if (typeof item === undefined || item === null || typeof item.setCursorBufferPosition !== 'function') {
                return;
            }
            try {
                // for some reason setCursorBufferPosition gets fired when the screen is not a code screen.
                item.setCursorBufferPosition([line - 1, 0]);
            } catch (e) {
                // do nothing
            }
        });
    }

    stylize(entry) {
        const { signature, name, type, receiver, has_parent } = entry;

        const _syntaxSrc = 'syntax--source syntax--go',
            _keyWord = 'syntax--keyword syntax--type syntax--go',
            _fn = 'syntax--entity syntax--name syntax--function syntax--go',
            _typeName = 'syntax--entity syntax--name syntax--type syntax--go',
            _struct = 'syntax--keyword syntax--struct syntax--go',
            _string = 'syntax--storage syntax--type syntax--string syntax--go',
            _num = 'syntax--storage syntax--type syntax--numeric syntax--go',
            _interface = 'syntax--keyword syntax--interface syntax--go',
            _variable = 'syntax--variable syntax--other syntax--assignment syntax--go';

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
                    out = `<span class="${_keyWord}">${sigSplit[0]}</span> <span class="${_typeName}">${sigSplit[1]}</span> ${sigSplit.reduce((p, c, i) => (i > 1 ? p + ' ' + c : p), '')}`;
                    break;
                default:
                    out = out.replace(name, `<span class="${_fn}">${name}</span>`);
            }
        }

        return out;
    }

    sort = entries => (this.state.byLine ? entries.sort((a, b) => a.line - b.line) : groupMethodsWithTypes(entries));

    toggleSort = () => {
        this.setState({ byLine: !this.state.byLine });
    };

    handleTabclick = byLine => {
        if (this.state.byLine !== byLine) {
            this.toggleSort();
        }
    };

    render() {
        const containerStyle = { height: '100%', overflowY: 'auto', marginTop: '1.5em' },
            htmlSpanStyle = { lineHeight: 1.7, fontSize: '1.1em' },
            lineNumStyle = {
                display: 'block',
                float: 'left',
                width: '2.5em',
                position: 'relative',
            },
            buttonStyle = { ...asText, color: 'orange', marginLeft: '.5em' },
            ulStyle = { zIndex: 0, listStyleType: 'none', paddingLeft: '0', marginTop: '.5em' },
            liStyle = {
                paddingLeft: '.5em',
                lineHeight: '1.9em',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                alignItems: 'stretch',
                position: 'relative',
            },
            asText = { background: 'none', border: 'none', margin: 0 },
            lineItemBtn = { position: 'absolute', width: '100%', textAlign: 'left' };

        const { entries } = this.props;

        return (
            <div style={containerStyle}>
                <Tabs handleOnClick={byLine => this.handleTabclick(byLine)} byLine={this.state.byLine} />
                <div>
                    <ul style={ulStyle}>
                        {this.sort(entries).map((e, i) => (
                            <li key={i} style={liStyle} onMouseEnter={() => {}} /* eventually make this change the background color */>
                                <span style={lineNumStyle} className="gutter">{`${e.line}:`}</span>
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
