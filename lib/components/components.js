'use babel';
import React from 'react';

const containerStyle = {
    height: '100%',
    overflowY: 'auto',
    paddingTop: '1.5em',
    borderLeftWidth: 2,
    borderLeftColor: '#568af2',
    borderLeftStyle: 'inset',
};

const msgTxtStyle = {
    color: 'rgba(161,167,180,.3)',
    textAlign: 'center',
};

const codeSnippetStyle = {
    color: 'rgba(161,167,180,1)',
};

const container = ({ children }) => <div style={containerStyle}>{children}</div>;

export const UpgradeComponent = () => (
    <contaner>
        <p style={msgTxtStyle}>Update of binary required</p>
        <p style={{ ...msgTxtStyle, ...codeSnippetStyle }}>go get -u github.com/natdm/go-typelist/.../</p>
    </contaner>
);
export const NoGo = () => (
    <contaner>
        <p style={msgTxtStyle}>Not a go file</p>
    </contaner>
);
export const Error = ({ error }) => (
    <contaner>
        <p style={msgTxtStyle}>error</p>
    </contaner>
);
