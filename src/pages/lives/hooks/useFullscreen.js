// src/components/Live/hooks/useFullscreen.js

import { useState, useEffect } from 'react';

export const useFullscreen = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showCommentsInFullscreen, setShowCommentsInFullscreen] = useState(true);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        const handleFullscreenError = (event) => {
            console.log('Fullscreen error event:', event);
            setIsFullscreen(false);
        };

        const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
        const errorEvents = ['fullscreenerror', 'webkitfullscreenerror', 'mozfullscreenerror', 'MSFullscreenError'];

        events.forEach(event => document.addEventListener(event, handleFullscreenChange));
        errorEvents.forEach(event => document.addEventListener(event, handleFullscreenError));

        return () => {
            events.forEach(event => document.removeEventListener(event, handleFullscreenChange));
            errorEvents.forEach(event => document.removeEventListener(event, handleFullscreenError));
        };
    }, []);

    const toggleFullscreen = async (element) => {
        if (!element) return;
        try {
            if (!document.fullscreenEnabled &&
                !document.webkitFullscreenEnabled &&
                !document.mozFullScreenEnabled &&
                !document.msFullscreenEnabled) {
                alert('Tu navegador no soporta pantalla completa');
                return;
            }

            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                await element.webkitRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                await element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                await element.msRequestFullscreen();
            }
        } catch (err) {
            console.error('Error al entrar en fullscreen:', err);
        }
    };

    const exitFullscreen = () => {
        try {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
        } catch (err) {
            console.error('Error al salir de fullscreen:', err);
        }
    };

    const toggleCommentsVisibility = () => {
        setShowCommentsInFullscreen(prev => !prev);
    };

    const closeComments = () => {
        setShowCommentsInFullscreen(false);
    };

    return {
        isFullscreen,
        showCommentsInFullscreen,
        toggleFullscreen,
        exitFullscreen,
        toggleCommentsVisibility,
        closeComments,
    };
};