import React from 'react';

type Props = {
    onClick: () => void;
};

const AgentButton: React.FC<Props> = ({ onClick }) => {
    return (
        <button role="button" aria-pressed="false" className="agent-button" onClick={onClick} aria-label="קבל מסקנות מהAI">
            <svg className="agent-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <circle cx="12" cy="7" r="3" stroke="white" strokeWidth="1.2" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="agent-text">קבל מסקנות מהAI</span>
        </button>
    );
};

export default AgentButton;
