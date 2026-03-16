import React from 'react';
import { AnimatePresence } from 'framer-motion';
import HistoryCard from './HistoryCard';

const HistoryGrid = ({ filteredGenerations, selectedCompareIds, isSelectionMode, handleCardClick }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
                {filteredGenerations.map((gen, index) => {
                    const isSelected = selectedCompareIds.includes(gen.id);
                    return (
                        <HistoryCard
                            key={gen.id}
                            gen={gen}
                            index={index}
                            isSelected={isSelected}
                            isSelectionMode={isSelectionMode}
                            handleCardClick={handleCardClick}
                        />
                    );
                })}
            </AnimatePresence>
            {/* If empty after filter */}
            {filteredGenerations.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-500 text-[14px]">
                    Ничего не найдено по этому запросу.
                </div>
            )}
        </div>
    );
};

export default React.memo(HistoryGrid);
