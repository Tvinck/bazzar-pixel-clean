import React from 'react';
import { EmptyHistory } from '../ui/EmptyStates';

const HistoryEmpty = ({ onCreateClick }) => {
    return (
        <div className="min-h-screen bg-[#1c1c1e] text-white md:max-w-5xl md:mx-auto">
            <EmptyHistory onCreateClick={onCreateClick} />
        </div>
    );
};

export default React.memo(HistoryEmpty);
