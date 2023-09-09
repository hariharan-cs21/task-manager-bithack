import React, { useState, useRef, useEffect } from 'react';
import myaudio2 from "./vellake_anirudh_bgm.mp3";
import myaudio3 from "./perfect.mp3";
import myaudio4 from "./Play Date.mp3";
import myaudio6 from "./Hukum.mp3";
import musicIc from "./Music.gif";
import myaudio7 from "./Adele-Set-Fire-To-The-Rain.mp3"
import myaudio8 from "./Ruth-B-Dandelions.mp3"
import myaudio9 from "./Cupid.mp3"

const Music = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [currentSeekPosition, setCurrentSeekPosition] = useState(0);

    const audioRef = useRef(null);
    const seekBarRef = useRef(null);

    const tracks = [
        { name: "Perfect", artist: "Ed Sheeran", file: myaudio3 },
        {
            name: "Play Date", artist: "Melanie Martinez", file: myaudio4
        },
        { name: "Hukum", artist: "Anirudh Ravichander", file: myaudio6 },
        { name: "Anirudh BGM", artist: "Anirudh Ravichander", file: myaudio2 },
        { name: "Set Fire", artist: "Adele", file: myaudio7 },
        { name: "Dandelions", artist: "Ruth B", file: myaudio8 },
        { name: "Cupid", artist: "FIFTY FIFTY", file: myaudio9 }
    ];

    const playPauseHandler = () => {
        if (audioRef.current) {
            setIsPlaying(prevState => !prevState);
            isPlaying ? audioRef.current.pause() : audioRef.current.play().catch(error => {
                console.error('Error playing audio:', error);
            });
        }
    };

    const nextTrackHandler = () => {
        const nextIndex = (currentTrackIndex + 1) % tracks.length;
        setCurrentTrackIndex(nextIndex);
        setIsPlaying(true);
        setCurrentSeekPosition(0);
    };

    const prevTrackHandler = () => {
        const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        setCurrentTrackIndex(prevIndex);
        setIsPlaying(true);
        setCurrentSeekPosition(0);
    };

    const toggleCollapse = () => {
        setIsCollapsed(prevState => !prevState);
    };

    const seekHandler = (e) => {
        if (audioRef.current && audioRef.current.readyState === 4) {
            const newSeekTime = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
            audioRef.current.currentTime = newSeekTime;
            setCurrentSeekPosition(parseFloat(e.target.value));
        }
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

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.addEventListener('loadedmetadata', () => {
                if (isPlaying) {
                    audioRef.current.play().catch(error => {
                        console.error('Error playing audio:', error);
                    });
                }
                seekBarRef.current.value = currentSeekPosition;
            });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('loadedmetadata', () => { });
            }
        };
    }, [currentTrackIndex, isPlaying, audioRef, currentSeekPosition]);
    useEffect(() => {
        audioRef.current.addEventListener('timeupdate', () => {
            const currentTime = audioRef.current.currentTime;
            const duration = audioRef.current.duration;
            const seekPercentage = (currentTime / duration) * 100;
            seekBarRef.current.value = seekPercentage;
        });

    })
    return (
        <div className={`fixed bottom-4 right-4 w-80 bg-black text-white rounded-lg shadow-lg transition-all duration-300 ${isPlaying ? 'ring-4 ring-purple-400' : ''}`}>
            <div className="p-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <img src={musicIc} alt="music" className="w-16 h-16 rounded-full" />
                        <div>
                            <h2 className="text-[14px] w-full font-semibold">{tracks[currentTrackIndex].name}</h2>
                            <p className="text-gray-400  text-sm">{tracks[currentTrackIndex].artist}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-4">
                        <button onClick={prevTrackHandler} className="p-2 text-gray-400 hover:text-white">
                            ⏮️
                        </button>
                        <button onClick={playPauseHandler} className="p-2 text-gray-400 hover:text-white">
                            {isPlaying ? '⏸️' : '▶️'}
                        </button>
                        <button onClick={nextTrackHandler} className="p-2 text-gray-400 hover:text-white">
                            ⏭️
                        </button>
                    </div>
                </div>
                {!isCollapsed && (
                    <div className="mt-4">
                        <h3 className="text-base font-semibold mb-2">Song List</h3>
                        <ul className="text-gray-400" style={{ overflowY: "auto", height: "150px" }}>
                            {tracks.map((track, index) => (
                                <li key={track.name} className={` text-sm hover:text-black hover:p-2 hover:bg-white hover:rounded-lg cursor-pointer ${track.name === tracks[currentTrackIndex].name ? 'text-white' : ''}`} onClick={() => setCurrentTrackIndex(index)}>
                                    {track.name} - {track.artist}
                                </li>
                            ))}

                        </ul>
                    </div>
                )}
                <input
                    ref={seekBarRef}
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="0"
                    className="w-full h-4 bg-gray-600 rounded-full"
                    onChange={seekHandler}
                    onInput={seekHandler}
                />
            </div>
            <div className={`bg-gray-800 p-2 text-center cursor-pointer transition-transform transform`} onClick={toggleCollapse}>
                {isCollapsed ? 'Show' : 'Hide'}
            </div>
            <audio ref={audioRef} src={tracks[currentTrackIndex].file} />
        </div>
    );
};

export default Music;
