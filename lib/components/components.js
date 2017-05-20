'use babel';
import React from 'react';

const containerStyle = {
    height: '100%',
    overflowY: 'auto',
    marginTop: '1.5em',
    borderLeftWidth: 2,
    borderLeftColor: '#568af2',
    borderLeftStyle: 'inset',
};

const msgTxtStyle = {
    color: 'rgba(161,167,180,.3)',
    textAlign: 'center',
};

const errStyleText = {
    color: '#e06c75',
    textAlign: 'center',
};

const asText = { background: 'none', border: 'none', margin: 0 };

const tabContainerStyle = {
    minWidth: '15em',
    width: '100%',
    position: 'absolute',
    top: 0,
    height: '1.5m',
};

const tabStyle = {
    ...asText,
    width: '50%',
};
const selectedClr = 'rgba(255,255,255,.8)';
const unselectedClr = 'rgba(161, 167, 180, 0.298039)';
const tabLeftStyle = selected => ({
    ...tabStyle,
    color: selected ? selectedClr : unselectedClr,
});

const tabRightStyle = selected => ({
    ...tabStyle,
    color: selected ? selectedClr : unselectedClr,
});

const codeSnippetStyle = {
    color: 'rgba(161,167,180,1)',
};

const container = ({ children }) => <div style={containerStyle}>{children}</div>;

export const NoGo = () => (
    <contaner>
        <p style={msgTxtStyle}>Not a go file</p>
    </contaner>
);
export const Error = ({ error }) => (
    <contaner>
        <p style={errStyleText}>{error}</p>
    </contaner>
);

export const LoadingMessage = ({ message }) => (
    <contaner>
        <p className="syntax--comment syntax--line syntax--double-slash syntax--js" style={{ textAlign: 'center' }}>{message}</p>
    </contaner>
);

export const Tabs = ({ handleOnClick, byLine }) => (
    <div style={tabContainerStyle}>
        <button style={tabLeftStyle(byLine)} onClick={() => handleOnClick(true)}>By Line</button>
        <button style={tabRightStyle(!byLine)} onClick={() => handleOnClick(false)}>By Method</button>
    </div>
);
