import React, { useState, useRef, useEffect } from 'react';
import myaudio from "./despacito.mp3";
import myaudio2 from "./vellake_anirudh_bgm.mp3";
import myaudio3 from "./perfect.mp3";
import myaudio4 from "./dzanum.mp3";
import myaudio5 from "./Manithan - Poi Vazhva.mp3"


import musicIc from "./Music.gif"


const Music = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const audioRef = useRef(null);

    const tracks = [myaudio, myaudio2, myaudio3, myaudio4, myaudio5];

    const playPauseHandler = () => {
        setIsPlaying(prevState => !prevState);
        if (audioRef.current) {
            isPlaying ? audioRef.current.pause() : audioRef.current.play();
        }
    };

    const nextTrackHandler = () => {
        setCurrentTrackIndex(prevIndex => (prevIndex + 1) % tracks.length);
        setIsPlaying(true);
    };

    const prevTrackHandler = () => {
        setCurrentTrackIndex(prevIndex => (prevIndex - 1 + tracks.length) % tracks.length);
        setIsPlaying(true);
    };

    const toggleCollapse = () => {
        setIsCollapsed(prevState => !prevState);
    };

    const extractFileName = (path) => {
        const parts = path.split('/');
        const fileNameWithExtension = parts[parts.length - 1];
        const fileNameWithoutExtension = fileNameWithExtension.replace('.mp3', '');
        const index = fileNameWithoutExtension.lastIndexOf('.');
        return index !== -1 ? fileNameWithoutExtension.substring(0, index) : fileNameWithoutExtension;
    };
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;

            if (isPlaying) {
                audioRef.current.play().catch(error => {
                    console.error('Error playing audio:', error);
                });
            }
        }
    }, [isPlaying, audioRef, currentTrackIndex]);


    return (
        <div className={`fixed bottom-8 right-8 bg-gray-900 text-white rounded-lg shadow-md overflow-hidden transition-width duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
            <div className={`p-4 ${isCollapsed ? 'hidden' : ''}`}>
                <h2 className="text-lg font-semibold mb-2">Now Playing</h2>
                <p className="mb-2">{extractFileName(tracks[currentTrackIndex])}</p>
                <audio ref={audioRef} src={tracks[currentTrackIndex]} />

                <div className="flex justify-between items-center">
                    <button
                        className="px-2 py-1 text-sm bg-gray-800 rounded-lg hover:bg-gray-700"
                        onClick={prevTrackHandler}
                    >
                        Prev
                    </button>
                    <button
                        className="px-4 py-2 text-lg bg-blue-500 rounded-full hover:bg-blue-400"
                        onClick={playPauseHandler}
                    >
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button
                        className="px-2 py-1 text-sm bg-gray-800 rounded-lg hover:bg-gray-700"
                        onClick={nextTrackHandler}
                    >
                        Next
                    </button>
                </div>
            </div>
            <div className="bg-white text-black text-center cursor-pointer" onClick={toggleCollapse}>
                {isCollapsed ? <img src={musicIc} alt='music' /> : '▼'}
            </div>

        </div>
    );
};

export default Music;
