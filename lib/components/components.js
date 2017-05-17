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
    width: '20em',
    height: '100%',
    overflowY: 'auto',
    paddingTop: '4.5em',
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

const keyframeStyle = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}`;

injectStyle(keyframeStyle);

const container = ({ children }) => <div style={containerStyle}>{children}</div>;

export const Loading = () => <div className="loader" />;
export const UpdateComponent = () => (
    <contaner>
        <p>Update your Typelist Go library please.</p>
        <p>Navigate to $GOPATH/src/githubcom/natdm/repo</p>
        <p>and run git pull && go install.</p>
    </contaner>
);
export const NoGo = () => (
    <contaner>
        <p>Not a go file</p>
    </contaner>
);
export const Error = ({ error }) => (
    <contaner>
        <p>error</p>
    </contaner>
);
