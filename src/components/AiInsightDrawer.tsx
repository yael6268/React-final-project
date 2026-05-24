import React, { useEffect } from 'react';

type Props = {
    open: boolean;
    onClose: () => void;
    loading: boolean;
    insight?: string | null;
};

const AiInsightDrawer: React.FC<Props> = ({ open, onClose, loading, insight }) => {
    // mount drawer only when open to avoid it being visible or interactive
    useEffect(() => {
        // when drawer opens, focus management could be added here
    }, [open]);

    if (!open) return null;

    return (
        <div className={`ai-drawer open`} role="dialog" aria-modal="true">
            <div className="ai-drawer-inner" dir="rtl">
                <div className="ai-drawer-header">
                    <h3>תובנה מה‑AI</h3>
                    <button aria-label="סגור" className="ai-btn close" onClick={onClose}>✕</button>
                </div>
                <div className="ai-drawer-body">
                    {loading ? (
                        <div className="ai-loading">
                            <div className="dots" aria-hidden>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <div className="ai-loading-text">טוען תובנה מה‑AI...</div>
                        </div>
                    ) : (
                        // show only the insight text; allow scrolling if content is long
                        <div className="ai-content">{insight ? insight : 'אין תוצאה להצגה.'}</div>
                    )}
                </div>
            </div>
            <div className="ai-drawer-backdrop" onClick={onClose} />
        </div>
    );
};

export default AiInsightDrawer;
