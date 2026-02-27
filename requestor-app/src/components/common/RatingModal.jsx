// src/components/common/RatingModal.jsx
import React, { useState } from 'react';
import API from '../../services/api';

const RatingModal = ({ ticket, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;
        setLoading(true);
        try {
            await API.rateTicket(ticket.id, rating, review);
            onSubmit(rating, review);
        } catch (err) {
            console.error('Rating submission failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" onClick={onClose}>
            <div className="bg-white rounded-2xl p-8 w-full max-w-[500px] mx-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Rate Your Experience</h2>
                    <p className="text-sm text-gray-500">Help us improve our service</p>
                </div>

                {/* Job Request ID Display */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">Job Request: </span>
                        <span className="text-blue-600 font-medium">{ticket.id}</span>
                    </div>
                    {ticket.title && (
                        <div className="text-sm text-gray-700 mt-2">
                            <span className="font-semibold">Service: </span>
                            {ticket.title}
                        </div>
                    )}
                </div>

                {/* Star Rating Section */}
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-800 mb-4">Rating</label>
                    <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                type="button"
                                key={star}
                                className={`text-5xl transition transform hover:scale-110 active:scale-95 ${
                                    rating >= star 
                                        ? 'text-amber-400 drop-shadow-md' 
                                        : 'text-gray-300 hover:text-amber-300'
                                }`}
                                onClick={() => setRating(star)}
                                title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <div className="text-center mt-3 text-sm font-medium text-blue-600">
                            {rating === 5 && "Excellent! 😊"}
                            {rating === 4 && "Good! 👍"}
                            {rating === 3 && "Average"}
                            {rating === 2 && "Could be better"}
                            {rating === 1 && "Poor"}
                        </div>
                    )}
                </div>

                {/* Review Section */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Review <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] resize-none"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your experience with this service..."
                        rows="4"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                        {review.length}/500 characters
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button 
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-100 text-gray-800 font-semibold transition hover:bg-gray-200 active:scale-95" 
                        onClick={onClose}
                    > 
                        Cancel 
                    </button>
                    <button 
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md transition hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
                        onClick={handleSubmit} 
                        disabled={rating === 0 || loading}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-circle-notch fa-spin"></i> 
                                Submitting...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-star"></i> 
                                Submit Rating
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;