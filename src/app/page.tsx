"use client";

import { useEffect, useRef, useState } from "react";

import {
  ImageSegmenter,
  FilesetResolver,
  ImageSegmenterResult,
} from "@mediapipe/tasks-vision";
import { Input } from "@nextui-org/input";
import { Form } from "@nextui-org/form";
import { Button } from "@nextui-org/button";

const LOREM = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Curabitur luctus massa quis nunc luctus aliquam.",
  "Maecenas eget nisi id neque vehicula venenatis in rutrum dui.",
  "Morbi vulputate lectus vel porta scelerisque.",
  "Etiam ornare nibh ac sapien laoreet varius.",
  "In et enim quis arcu venenatis tempus ac a justo.",
  "Quisque in ipsum placerat, auctor justo ac, cursus ipsum.",
  "Integer et purus pharetra, efficitur libero ut, finibus libero.",
  "Nulla venenatis velit et eros congue sollicitudin.",
  "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...",
  "超级无敌炫酷吊炸天",
];

export default function Home() {
  const [canvasSize, setCanvasSize] = useState([0, 0]);
  const [danmakuMap, setDanmakuMap] = useState<
    Map<number, Map<string, string>>
  >(() => {
    const m = new Map();
    m.set(0, new Map());
    m.set(1, new Map());
    m.set(2, new Map());
    m.set(3, new Map());
    m.set(4, new Map());
    m.set(5, new Map());
    m.set(6, new Map());
    return m;
  });
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();

  const prepareVideoStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener("loadeddata", () => {
        if (
          videoRef.current?.readyState &&
          videoRef.current?.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
        ) {
          const { videoWidth, videoHeight } = videoRef.current;
          setCanvasSize([videoWidth, videoHeight]);
        }
      });
    }
  };

  const process = async (videoWidth: number, videoHeight: number) => {
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

    const canvas = maskCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    const video = videoRef.current!;

    const callbackForVideo = (result: ImageSegmenterResult) => {
      const imageData = ctx?.getImageData(
        0,
        0,
        videoWidth || 640,
        videoHeight || 480
      ).data;
      const mask = result?.categoryMask?.getAsFloat32Array();

      let j = 0;
      if (mask && imageData) {
        for (let i = 0; i < mask.length; ++i) {
          if (mask[i] === 0) {
            imageData[j + 3] = 0;
          }
          j += 4;
        }
        const uint8Array = new Uint8ClampedArray(imageData.buffer);
        const dataNew = new ImageData(
          uint8Array,
          videoWidth || 640,
          videoHeight || 480
        );
        ctx?.putImageData(dataNew, 0, 0);
        requestAnimationFrame(predictWebcam);
      }
    };

    const predictWebcam = async () => {
      if (!video || !maskCanvasRef.current) return;
      if (video.currentTime === lastWebcamTime) {
        requestAnimationFrame(predictWebcam);
        return;
      }

      lastWebcamTime = video.currentTime;
      ctx?.drawImage(video, 0, 0, videoWidth || 640, videoHeight || 480);
      if (imageSegmenter === undefined) {
        return;
      }
      const startTimeMs = performance.now();
      imageSegmenter.segmentForVideo(video, startTimeMs, callbackForVideo);
    };

    predictWebcam();
  };

  const renderDanmaku = (danmaku: string) => {
    const row = Math.floor(Math.random() * 7);
    const timeStamp = new Date().getTime().toString();

    setDanmakuMap((t) =>
      new Map(t).set(row, new Map(t.get(row)).set(timeStamp, danmaku))
    );

    setTimeout(() => {
      setDanmakuMap((t) => {
        const targetMap = new Map(t.get(row));
        targetMap.delete(timeStamp);
        return new Map(t).set(row, targetMap);
      });
    }, 6000);
  };

  const handleAutoGenerate = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(undefined);
    } else {
      const id = setInterval(() => {
        const idx = Math.floor(Math.random() * LOREM.length);
        renderDanmaku(LOREM[idx]);
      }, 500);
      renderDanmaku("超级无敌炫酷吊炸天");
      setIntervalId(id);
    }
  };

  useEffect(() => {
    prepareVideoStream();
  }, []);

  useEffect(() => {
    if (canvasSize[0] && canvasSize[1]) {
      process(canvasSize[0], canvasSize[1]);
    }
  }, [canvasSize]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col items-center min-h-screen p-8 w-full justify-center">
      <a
        href={"https://github.com/Cygra/danmaku-mask"}
        className={"fixed top-2 right-2 text-white underline"}
        target={"_blank"}
      >
        Github
      </a>
      <div
        className="rounded-lg overflow-hidden relative w-[800px]"
        style={{
          height:
            canvasSize[0] && canvasSize[1]
              ? (800 * canvasSize[1]) / canvasSize[0]
              : 0,
        }}
      >
        <video
          playsInline
          ref={videoRef}
          autoPlay
          muted
          className={"absolute w-[800px]"}
          style={{
            height:
              canvasSize[0] && canvasSize[1]
                ? (800 * canvasSize[1]) / canvasSize[0]
                : 0,
            transform: "rotateY(180deg)",
          }}
        />

        {Array.from(danmakuMap.entries()).map((it) =>
          Array.from(it[1].entries()).map((d) => (
            <div
              key={it[1] + d[0] + d[1]}
              className={`absolute pt-1 animate-danmaku text-4xl font-semibold whitespace-nowrap`}
              style={{
                textShadow: "#000 1px 0 1px",
                animationFillMode: "forwards",
                top: 40 * it[0],
              }}
            >
              {d[1]}
            </div>
          ))
        )}

        <canvas
          ref={maskCanvasRef}
          width={canvasSize[0]}
          height={canvasSize[1]}
          className="absolute w-[800px]"
          style={{ transform: "rotateY(180deg)" }}
        />
      </div>
      {canvasSize[0] ? (
        <Form
          ref={formRef}
          className="w-full max-w-xl mt-2 flex flex-row"
          validationBehavior="native"
          onSubmit={(e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.currentTarget));
            const { danmaku } = data;
            renderDanmaku(danmaku.toString());
            formRef.current?.reset();
          }}
        >
          <Input
            isRequired
            disabled={!!intervalId}
            errorMessage="Please enter somthing"
            name="danmaku"
            placeholder="Write something, click [Enter] to send"
            type="text"
          />
          <Button
            className="ml-2"
            color={intervalId ? "danger" : "primary"}
            onPress={handleAutoGenerate}
          >
            {intervalId ? "Stop" : "Auto Generate"}
          </Button>
        </Form>
      ) : null}
    </div>
  );
}
