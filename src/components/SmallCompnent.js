import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated, config } from 'react-spring';

const MotivationalQuote = () => {
    const [quoteData, setQuoteData] = useState([]);
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synth = useRef(window.speechSynthesis);

    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const response = await fetch("https://type.fit/api/quotes");
                const data = await response.json();
                setQuoteData(data);
            } catch (error) {
                console.error("Error fetching quotes:", error);
            }
        };

        fetchQuotes();
    }, []);

    useEffect(() => {
        if (isSpeaking) {
            speakQuote();
        }
    }, [quoteIndex, isSpeaking]);

    const quoteSpring = useSpring({
        opacity: 1,
        transform: 'translateY(0px)',
        config: config.molasses,
    });

    const changeQuote = () => {
        if (isSpeaking) {
            synth.current.cancel();
        }

        quoteSpring.opacity = 0;
        quoteSpring.transform = 'translateY(20px)';
        setTimeout(() => {
            setQuoteIndex((prevIndex) => (prevIndex + 1) % quoteData.length);
            if (isSpeaking) {
                setTimeout(() => {
                    speakQuote();
                }, 500);
            }
            quoteSpring.opacity = 1;
            quoteSpring.transform = 'translateY(0px)';
        }, 500);
    };

    const extractMotivationalQuote = () => {
        const quoteElement = document.querySelector(".text-xl.font-semibold.mb-4");
        return quoteElement ? quoteElement.textContent : '';
    };

    const speakQuote = () => {
        if (isSpeaking) {
            const quoteText = extractMotivationalQuote();

            const utterance = new SpeechSynthesisUtterance(quoteText);
            synth.current.speak(utterance);
        }
    };

    const subscribeButtonRef = useRef(null);

    const toggleSpeech = () => {
        if (!isSpeaking) {
            setIsSpeaking(true);
            speakQuote();
        } else {
            setIsSpeaking(false);
            synth.current.cancel();
        }
    };

    return (
        <div className="bg-gradient-to-b from-gold-500 via-gold-700 to-gold-900 p-6 rounded-lg mt-4 shadow-lg">
            <animated.div style={{ ...quoteSpring, overflow: 'hidden' }}>
                <p className="text-xl font-semibold mb-4">
                    {quoteData.length > 0 ? quoteData[quoteIndex].text : 'Loading...'}
                </p>
                <p className="text-lg">- {quoteData.length > 0 ? quoteData[quoteIndex].author : 'Unknown'}</p>
            </animated.div>
            <button onClick={changeQuote} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-110">
                Next Quote
            </button>
            <button onClick={toggleSpeech} ref={subscribeButtonRef} className={`ml-6 rounded-md transition duration-300 ease-in-out transform hover:scale-110`}>
                {isSpeaking ? <i className="uil uil-volume text-xl"></i> : <i className="uil uil-volume-mute text-xl"></i>}
            </button>
        </div>
    );
};

export default MotivationalQuote;
