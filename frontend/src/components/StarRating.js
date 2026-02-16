import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating = 0, size = 'md', showValue = true }) => {
    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-2xl',
    };

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(<FaStar key={i} className="text-yellow-400" />);
        } else if (i === fullStars && hasHalfStar) {
            stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
        } else {
            stars.push(<FaRegStar key={i} className="text-yellow-400" />);
        }
    }

    return (
        <div className={`flex items-center gap-1 ${sizeClasses[size]}`}>
            {stars}
            {showValue && (
                <span className="text-gray-600 text-sm ml-1">({rating.toFixed(1)})</span>
            )}
        </div>
    );
};

export default StarRating;
