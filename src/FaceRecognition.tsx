import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceRecognition: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const [expression, setExpression] = useState<string>('neutral');

    const emoticon = 
        expression === 'neutral' ? '😐' : 
        expression === 'happy' ? '😀' : 
        expression === 'sad' ? '😢' : 
        expression === 'angry' ? '😠' : 
        expression === 'fearful' ? '😨' : 
        expression === 'disgusted' ? '🤢' : 
        expression === 'surprised' ? '😮' : '😐';

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = process.env.PUBLIC_URL + '/models';
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
            await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        };

        const setupCamera = async () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const video = videoRef.current;
                video!.srcObject = await navigator.mediaDevices.getUserMedia({ video: {} });
                video!.play();
            }
        };

        loadModels().then(setupCamera);

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        const detectFaces = async () => {
            const video = videoRef.current;
            if (!video) return;

            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
           if (detections.length) {
                const [detection] = detections;
                const { expressions } = detection;
                let maxExpression = "";
                let maxValue = 0;

                for (const [key, value] of Object.entries(expressions)) {
                    if (value > maxValue) {
                        maxValue = value;
                        maxExpression = key;
                    }
                }
                setExpression(maxExpression);

           }
        };

        const intervalId = setInterval(detectFaces, 100);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{ display: 'flex' }}>
            <video ref={videoRef} width="720" height="560" autoPlay muted />
            <div style={{ fontSize: '400px' }}>{emoticon}</div>
        </div>
    );
};

export default FaceRecognition;
