'use babel';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class View extends Component {
    constructor(p) {
        super(p);
        this.state = {
            byLine: true,
        };
    }

    navToItem(line) {
        atom.workspace.observeTextEditors(editor => {
            editor.setCursorScreenPosition([line - 1, 0]);
        });
    }

    stylize(entry) {
        const { signature, name, type, receiver } = entry;

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
            .replace(/type/, `<span class="${_keyWord}">type</span>`)
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
            .replace(/const/, `<span class="${_keyWord}">const</span>`)
            .replace(/var/, `<span class="${_keyWord}">var</span>`)
            .replace(/error/, `<span class="${_keyWord}">error</span>`)
            .replace(/complex128/, `<span class="${_keyWord}">complex128</span>`);

        // if a method, group by method
        if (receiver != null && !this.state.byLine) {
            // if a pointer receiver, do something fancier.
            if (receiver.pointer) {
                out = out.replace(`func (${receiver.alias} *${receiver.type_name})`, '&nbsp;&nbsp;&#9507');
            } else {
                out = out.replace(`func (${receiver.alias} ${receiver.type_name})`, '&nbsp;&nbsp;&#9501');
            }
        }

        if (out.indexOf('func (') > -1) {
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
                case 'StructType':
                    out = out.replace(name, `<span class="${_typeName}">${name}</span>`);
                    break;
                case 'GenDecl':
                    if (out.indexOf('var') > -1) {
                        out = out.replace(name, `<span class="${_variable}">${name}</span>`);
                        break;
                    }
                    out = out.replace(name, `<span class="${_typeName}">${name}</span>`);
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

        // keep track of methods
        let genDecls = {};
        // To-be returned value
        let out = [];

        // build struct types, as well as anything not a struct and not a method (send that to out)
        entries.forEach(e => {
            if (e.type !== 'MethodDecl' && e.type !== 'GenDecl') {
                // Not a method and
                out = [...out, e];
            }
            if (e.type === 'GenDecl') {
                genDecls[e.name] = {
                    ...e,
                    methods: [],
                };
            }
        });

        // build methods on structs
        entries.forEach(e => {
            if (e.type === 'MethodDecl') {
                Object.keys(genDecls).forEach(typeName => {
                    if (e.receiver !== null && e.receiver.type_name === typeName) {
                        genDecls[typeName].methods = [...genDecls[typeName].methods, e];
                    }
                });
            }
        });

        // Parse types to an array. For some reason Object.values is not working.
        Object.keys(genDecls).forEach(key => {
            out = [...out, genDecls[key], ...genDecls[key].methods];
        });
        return out;
    }

    toggleSort() {
        this.setState({ byLine: !this.state.byLine });
    }

    render() {
        const containerStyle = {
            width: '20em',
            height: '100%',
            overflowY: 'auto',
            paddingTop: '4.5em',
            borderLeftWidth: 2,
            borderLeftColor: '#568af2',
            borderLeftStyle: 'inset',
        };
        const headerWrapperStyle = {
            position: 'absolute',
            top: 0,
            width: '100%',
            height: '4.5em',
            backgroundColor: '#21252b',
        };
        const headerContainerStyle = { margin: '.5em' };
        const headerTextStyle = { fontWeight: 600 };
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
            marginLeft: 5,
            color: 'orange',
            position: 'absolute',
            right: 0,
            marginRight: '1em',
        };
        const ulStyle = { listStyleType: 'none', paddingLeft: '0' };
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

        return (
            <div style={containerStyle}>
                <div style={headerWrapperStyle}>
                    <div style={headerContainerStyle}>
                        <span style={headerTextStyle}>
                            {!this.state.byLine ? 'Viewing Grouped by Type.' : 'Viewing Sorted by Line.'}
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
