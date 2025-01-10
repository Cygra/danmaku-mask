"use client";

import { useEffect, useRef } from "react";

import {
  ImageSegmenter,
  FilesetResolver,
  ImageSegmenterResult,
} from "@mediapipe/tasks-vision";

const legendColors = [
  [147, 170, 0, 255],
  [166, 189, 215, 255],
];

export default function Home() {
  const process = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    let lastWebcamTime = -1;
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    const imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/image_segmenter/deeplab_v3/float32/1/deeplab_v3.tflite",
        delegate: "GPU",
      },
      outputCategoryMask: true,
      outputConfidenceMasks: false,
      runningMode: "VIDEO",
    });

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const video = videoRef.current;

    const callbackForVideo = (result: ImageSegmenterResult) => {
      const imageData = ctx?.getImageData(
        0,
        0,
        video!.videoWidth || 640,
        video!.videoHeight || 480
      ).data;
      const mask = result?.categoryMask?.getAsFloat32Array();

      let j = 0;
      if (mask && imageData) {
        for (let i = 0; i < mask.length; ++i) {
          const maskVal = Math.round(mask[i] * 255.0);
          const legendColor = legendColors[maskVal % legendColors.length];
          imageData[j] = legendColor[0] + imageData[j];
          imageData[j + 1] = (legendColor[1] + imageData[j + 1]) / 2;
          imageData[j + 2] = (legendColor[2] + imageData[j + 2]) / 2;
          imageData[j + 3] = (legendColor[3] + imageData[j + 3]) / 2;
          j += 4;
        }
        const uint8Array = new Uint8ClampedArray(imageData.buffer);
        const dataNew = new ImageData(
          uint8Array,
          video!.videoWidth || 640,
          video!.videoHeight || 480
        );
        ctx?.putImageData(dataNew, 0, 0);
        requestAnimationFrame(predictWebcam);
      }
    };

    const predictWebcam = async () => {
      if (!video || !canvasRef.current) return;
      if (video.currentTime === lastWebcamTime) {
        requestAnimationFrame(predictWebcam);
        return;
      }

      lastWebcamTime = video.currentTime;
      ctx?.drawImage(
        video,
        0,
        0,
        video!.videoWidth || 640,
        video!.videoHeight || 480
      );
      if (imageSegmenter === undefined) {
        return;
      }
      const startTimeMs = performance.now();
      imageSegmenter.segmentForVideo(video, startTimeMs, callbackForVideo);
    };

    predictWebcam();
  };

  useEffect(() => {
    process();
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="flex items-center min-h-screen p-8 w-full justify-center">
      <canvas ref={canvasRef} width={640} height={480} className="w-[800px]" />

      <video playsInline ref={videoRef} autoPlay className={"hidden"}></video>
    </div>
  );
}
