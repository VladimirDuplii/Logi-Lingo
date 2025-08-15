import React from 'react';
import { ProgressService } from '../../Services';

const UnitList = ({ courseId, units, onUnitSelect }) => {
    if (!units || units.length === 0) {
        return <div className="no-units">No units available for this course.</div>;
    }

    const handleUnitClick = async (unit) => {
        // Tracking that user viewed this unit - optional
        try {
            await ProgressService.trackUnitView(courseId, unit.id);
        } catch (error) {
            console.error('Error tracking unit view:', error);
            // Continue anyway as this is just tracking
        }
        
        // Notify parent component about unit selection
        if (onUnitSelect) {
            onUnitSelect(unit);
        }
    };

    return (
        <div className="unit-list">
            <h2>Course Units</h2>
            <div className="units">
                {units.map(unit => (
                    <div 
                        key={unit.id} 
                        className="unit-item"
                        onClick={() => handleUnitClick(unit)}
                    >
                        <div className="unit-number">{unit.order}</div>
                        <div className="unit-content">
                            <h3>{unit.title}</h3>
                            <p>{unit.description}</p>
                            <div className="unit-meta">
                                <span className="lesson-count">{unit.lessons_count} lessons</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UnitList;
