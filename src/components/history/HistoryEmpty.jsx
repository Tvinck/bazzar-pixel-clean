import React from 'react';
import { EmptyHistory } from '../ui/EmptyStates';

const HistoryEmpty = ({ onCreateClick }) => {
    return (
        <div className="min-h-screen bg-bg-secondary text-white md:max-w-5xl md:mx-auto">
            <EmptyHistory onCreateClick={onCreateClick} />
        </div>
    );
};

export default React.memo(HistoryEmpty);
