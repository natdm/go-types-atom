'use babel';
import React from 'react';

const injectStyle = style => {
    const styleElement = document.createElement('style');
    let styleSheet = null;

    document.head.appendChild(styleElement);

    styleSheet = styleElement.sheet;

    styleSheet.insertRule(style, styleSheet.cssRules.length);
};

const containerStyle = {
    height: '100%',
    overflowY: 'auto',
    paddingTop: '1.5em',
    borderLeftWidth: 2,
    borderLeftColor: '#568af2',
    borderLeftStyle: 'inset',
};

const loadingStyle = {
    border: '16px solid #f3f3f3' /* Light grey */,
    borderTop: '16px solid #3498db' /* Blue */,
    borderRadius: '50%',
    width: '120px',
    height: '120px',
    animation: 'spin 2s linear infinite',
};

const msgTxtStyle = {
    color: 'rgba(161,167,180,.3)',
    textAlign: 'center',
};

const codeSnippetStyle = {
    color: 'rgba(161,167,180,1)',
};

const keyframeStyle = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}`;

injectStyle(keyframeStyle);

const container = ({ children }) => <div style={containerStyle}>{children}</div>;

export const Loading = () => <div className="loader" />;
export const UpgradeComponent = () => (
    <contaner>
        <p style={msgTxtStyle}>Update of binary required</p>
        <p style={msgTxtStyle}>Navigate to</p>
        <p style={{ ...msgTxtStyle, ...codeSnippetStyle }}>$GOPATH/src/github.com/natdm/go-types</p>
        <p style={msgTxtStyle}>and run <span style={codeSnippetStyle}>git pull && go install.</span></p>
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
